const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },
  getWordById(db, id) {
    return db('word')
      .select()
      .where({ id })
      .first();
  },
  async getHead(db, langId) {
    const head = await db('language AS l')
      .select('w.*', 'l.total_score')
      .join('word AS w', 'l.head', '=', 'w.id')
      .where({ 'l.id': langId })
      .first();
    head.id = Number(head.id);
    return head;
  },
  updateCount(db, isCorrect, langId, wordId) {
    return db.transaction(async trx => {
      const word = await trx('word')
        .select('correct_count', 'incorrect_count', 'id')
        .where({ id: wordId })
        .first();
      if (isCorrect === true) {
        let { total_score } = await trx('language')
          .select('total_score')
          .where({ id: langId })
          .first();
				total_score = Number(total_score);
        await trx('language')
          .where({ id: langId })
          .update({ total_score: total_score + 1 });
        await trx('word')
          .where({ id: wordId })
          .update({ correct_count: word.correct_count + 1 });
      } else {
        await trx('word')
          .where({ id: word.id })
          .update({ incorrect_count: word.incorrect_count + 1 });
      }
    });
  },
  updateMemVal(db, id, memory_value) {
    return db('word')
        .where({ id })
        .update({ memory_value })
				.returning('*')
				.then( rows => rows[0]);
  },
  updateHead(db, langId) {
    //pushes back the current head by the number in memory_value
    return db.transaction(async trx => {
      try {
        const head = await LanguageService.getHead(db, langId);
        const newPrevious = await (async function findNextHead(
          node,
          targetPosition,
          position = 0
        ) {
          if (node.next === null || position === targetPosition) return node;
          return findNextHead(
            await LanguageService.getWordById(trx, node.next),
            targetPosition,
            position + 1
          );
        })(head, head.memory_value);

        //inserts the current head after newPrevious
        await trx('word')
          .where({ id: head.id })
          .update({ next: newPrevious.next });
        await trx('word')
          .where({ id: newPrevious.id })
          .update({ next: head.id });
        await trx('language')
          .where({ id: langId })
          .update({ head: head.next });
        return LanguageService.getHead(trx, langId);
      } catch (error) {
        throw error;
      }
    });
  },
};

module.exports = LanguageService;
