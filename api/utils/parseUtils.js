const parseUtils = {
    validateValueAsBoolean: (value) => {
        if (value === "" || value === undefined || value === null || value === "null" || value instanceof Array && value.length === 0) return false; 
        else return true;

    } 
}

module.exports = parseUtils;
