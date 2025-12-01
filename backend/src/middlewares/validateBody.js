export const validateBody = (requiredFields = []) => {
    return (req, res, next) => {
        const missing = [];
        for(const f of requiredFields){
            if(req.body[f] === undefined || req.body[f] === null || req.body[f] === ''){
                missing.push(f);
            }
        }
        if(missing.length){
            const err = new Error('Missing required fields');
            err.status = 400;
            err.details = { fields: missing };
            return next(err);
        }
        next();
    }
}
