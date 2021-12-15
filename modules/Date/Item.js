
module.exports = {
    
    getDate(s) {
        let separator =
            s.indexOf('.') > 0 ? '.' :
            s.indexOf('-') > 0 ? '-' :
            s.indexOf('/') > 0 ? '/' :
            s.indexOf('_') > 0 ? '_' : null;

        if (!separator) {
            return null;
        }

        let ps = s.split(separator);

        return {
            'yyyy': ps[0],
            'MM': ps[1] || 0,
            'dd': ps[2] || 1,
        };
    },

    getTime(s) { 
        let separator = s.indexOf(':') > 0 ? ':' : null;

        if (!separator) {
            return null;
        }

        let ps = s.split(separator);

        return {
            'HH': ps[0] || 0,
            'mm': ps[1] || 0,
            'ss': ps[2] || 0,
        };
    },
};