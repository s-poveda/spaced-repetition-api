const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

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
		}
		res.json(head);
	} catch (error) {
		next(error);
	}
});

languageRouter.post('/guess', async (req, res, next) => {
  // implement me
  res.send('implement me!');
});

module.exports = languageRouter;
