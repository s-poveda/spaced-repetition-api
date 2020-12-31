const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

const jsonBodyParser = express.json();
const languageRouter = express.Router();

languageRouter.use(requireAuth).use( async (req, res, next) => { //sets req.language and returns 404 if the user doesn't have a language
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id
    );

    res.json({
      language: req.language,
      words,
    });
		// QUESTION: why "next()"?
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  try {
		let head = await LanguageService.getHead(
			req.app.get('db'),
			req.language.id
		);
		head = {
			nextWord: head.original,
			totalScore: head.totalScore,
			wordCorrectCount: head.correct_count,
			wordIncorrectCount: head.incorrect_count,
			totalScore: head.total_score,
		};
		res.json(head);
	} catch (error) {
		next(error);
	}
});

languageRouter.post('/guess', jsonBodyParser, async (req, res, next) => {
  try {
		const { guess } = req.body;
		if (!guess) return res.status(400).json({ error: `Missing 'guess' in request body` });
		let head = await LanguageService.getHead(req.app.get('db'),	req.language.id);
		const isCorrect = guess === head.translation? true : false;
		if (isCorrect) {
			head = await LanguageService.updateMemVal(req.app.get('db'), head.id, head.memory_value * 2);
			req.language.total_score++;
		} else {
			head = await LanguageService.updateMemVal(req.app.get('db'), head.id, 1);
		}
		await LanguageService.updateCount(
			req.app.get('db'),
			isCorrect,
			req.language.id,
			head.id
		);
		//returns the new head
		const newHead = await LanguageService.updateHead(
			req.app.get('db'),
			req.language.id
		);
		// const updatedLang = await LanguageService.getUsersLanguage(req.app.get('db'), req.user.id);
		res.json({
			isCorrect,
			answer: head.translation,
			totalScore: req.language.total_score,
			nextWord: newHead.original,
			wordCorrectCount: newHead.correct_count,
			wordIncorrectCount: newHead.incorrect_count,
		});
	} catch (error) {
		next(error);
	}
});

module.exports = languageRouter;
