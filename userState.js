const userStates = {};

function getState(userId) {
    if (!userStates[userId]) {
        userStates[userId] = {
            miniGameProgress: 0,
            currentFlower: null,
            lastNewsDate: null,
            lastQuizDate: null,
            lastMiniGameDate: null,
            taskHistory: [],
            quizProgress: 0,
            activityHistory: {}
        };
    }
    return userStates[userId];
}

module.exports = {
    getState
};