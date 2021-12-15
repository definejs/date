const $String = require('@definejs/string');
const Item = require('./Date/Item');

const MS = 1;
const SECOND = 1000 * MS;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;



let meta = {
    delta: 0,   //用于存放参考时间(如服务器时间)和本地时间的差值。
};


/**
* 日期时间工具。
*/
module.exports = exports = {
    /**
    * 一毫秒对应的毫秒数。
    */
    MS,

    /**
    * 一秒对应的毫秒数。
    */
    SECOND,

    /**
    * 一分钟对应的毫秒数。
    */
    MINUTE,

    /**
    * 一小时对应的毫秒数。
    */
    HOUR,

    /**
    * 一天对应的毫秒数。
    */
    DAY,

    /**
    * 一周对应的毫秒数。
    */
    WEEK,

    /**
    * 把指定的时间长度解析成等价的几周几天几小时几分几秒几毫秒。
    * 如 3750*1000，会给解析成 1 小时 2 分 30 秒。
    * @param {number} value 时间长度，单位为毫秒。
    * @returns {Object} 返回一个数据对象。
    *   {
    *       weeks: 0,           //对应的整数周。
    *       days: 0,            //扣除整数周后剩余的天数。
    *       hours: 0,           //扣除整数天后剩余的小时数。
    *       minutes: 0,         //扣除整数小时后剩余的分钟数。
    *       seconds: 0,         //扣除整数分钟数后剩余的秒数。
    *       milliseconds: 0,    //扣除整数秒数后剩余的毫秒数。
    *       value: 0,           //原始的毫秒数。
    *       desc: {             //描述。
    *           ww: '',         //`n周`
    *           dd: '',         //`n天`
    *           hh: '',         //`n小时`
    *           mm: '',         //`n分钟`
    *           ss: '',         //`n秒`
    *           ms: '',         //`n毫秒`
    *       },
    *   }
    */
    size(value) {
        let ww = Math.floor(value / WEEK);
        let dd = Math.floor(value % WEEK / DAY);
        let hh = Math.floor(value % DAY / HOUR);
        let mm = Math.floor(value % DAY % HOUR / MINUTE);
        let ss = Math.floor(value % DAY % HOUR % MINUTE / SECOND);
        let ms = Math.floor(value % DAY % HOUR % MINUTE % SECOND / MS);

        let desc = {
            'ww': ww > 0 ? `${ww}周` : ``,
            'dd': dd > 0 ? `${dd}天` : ``,
            'hh': hh > 0 ? `${hh}小时` : ``,
            'mm': mm > 0 ? `${mm}分` : ``,
            'ss': ss > 0 ? `${ss}秒` : ``,
            'ms': ms > 0 ? `${ms}毫秒` : ``,
        };


        return {
            'weeks': ww,
            'days': dd,
            'hours': hh,
            'minutes': mm,
            'seconds': ss,
            'milliseconds': ms,
            'value': value,
            'desc': desc,
        };
    },

    /**
    * 把参数 value 解析成等价的日期时间实例。
    * @param {Date|String} value 要进行解析的参数，可接受的类型为：
    *   1.Date 实例
    *   2.String 字符串，包括调用 Date 实例的 toString 方法得到的字符串；也包括以下格式: 
    *       yyyy-MM-dd
    *       yyyy.MM.dd
    *       yyyy/MM/dd
    *       yyyy_MM_dd
    *       HH:mm:ss
    *       yyyy-MM-dd HH:mm:ss
    *       yyyy.MM.dd HH:mm:ss
    *       yyyy/MM/dd HH:mm:ss
    *       yyyy_MM_dd HH:mm:ss
    * @return 返回一个日期时间的实例。
    *   如果解析失败，则返回 null。
    * @example
    *   $Date.parse('2013-04-29 09:31:20');
    */
    parse(value) {
        //已经是一个 Date 实例，则判断它是否有值。
        if (value instanceof Date) {
            let tv = value.getTime();
            return isNaN(tv) ? null : value;
        }

        let isString = false;

        switch (typeof value) {
            case 'number':
                let dt = new Date(value);
                let tv = dt.getTime();
                return isNaN(tv) ? null : dt;

            case 'string':
                isString = true;
                break;

        }

        if (!isString) {
            return null;
        }


        //标准方式
        let date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }

        /*
         自定义方式：
            yyyy-MM-dd
            yyyy.MM.dd
            yyyy/MM/dd
            yyyy_MM_dd
            HH:mm:ss
            yyyy-MM-dd HH:mm:ss
            yyyy.MM.dd HH:mm:ss
            yyyy/MM/dd HH:mm:ss
            yyyy_MM_dd HH:mm:ss
                
        */

        let parts = value.split(' ');
        let left = parts[0];

        if (!left) {
            return null;
        }

        //冒号只能用在时间的部分，而不能用在日期部分
        date = left.indexOf(':') > 0 ? null : left;
        let time = date ? (parts[1] || null) : date;

        //既没指定日期部分，也没指定时间部分
        if (!date && !time) {
            return null;
        }


        if (date && time) {
            let d = Item.getDate(date);
            let t = Item.getTime(time);
            return new Date(d.yyyy, d.MM - 1, d.dd, t.HH, t.mm, t.ss);
        }

        if (date) {
            let d = Item.getDate(date);
            return new Date(d.yyyy, d.MM - 1, d.dd);
        }

        if (time) {
            let now = new Date();
            let t = Item.getTime(time);
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.HH, t.mm, t.ss);
        }

    },

    /**
    * 把日期时间格式化指定格式的字符串。
    * 已重载 format(formatter)。
    * @param {Date} datetime 要进行格式化的日期时间。
    *   如果不指定，则默认为当前时间，即 new Date()。
    * @param {string} formater 格式化的字符串。 其中保留的占位符有：
        'yyyy': 4位数年份
        'yy': 2位数年份
        'MM': 2位数的月份(01-12)
        'M': 1位数的月份(1-12)
        'dddd': '星期日|一|二|三|四|五|六'
        'dd': 2位数的日份(01-31)
        'd': 1位数的日份(1-31)
        'HH': 24小时制的2位数小时数(00-23)
        'H': 24小时制的1位数小时数(0-23)
        'hh': 12小时制的2位数小时数(00-12)
        'h': 12小时制的1位数小时数(0-12)
        'mm': 2位数的分钟数(00-59)
        'm': 1位数的分钟数(0-59)
        'ss': 2位数的秒钟数(00-59)
        's': 1位数的秒数(0-59)
        'tt': 上午：'AM'；下午: 'PM'
        't': 上午：'A'；下午: 'P'
        'TT': 上午： '上午'； 下午: '下午'
        'T': 上午： '上'； 下午: '下'
    * @return {string} 返回一个格式化的字符串。
    * @example
        //返回当前时间的格式字符串，类似 '2013年4月29日 9:21:59 星期一'
        $Date.format(new Date(), 'yyyy年M月d日 h:m:s dddd');
        $Date.format('yyyy年M月d日 h:m:s dddd');
    */
    format(datetime, formater) {
        //重载 format(formater);
        if (arguments.length == 1) {
            formater = datetime;
            datetime = new Date();
        }
        else {
            datetime = exports.parse(datetime);
        }

        let year = datetime.getFullYear();
        let month = datetime.getMonth() + 1;
        let date = datetime.getDate();
        let hour = datetime.getHours();
        let minute = datetime.getMinutes();
        let second = datetime.getSeconds();

        let padLeft = function (value, length) {
            return $String.padLeft(value, length, '0');
        };


        let isAM = hour <= 12;

        //这里不要用 {} 来映射，因为 for in 的顺序不确定
        let maps = [
            ['yyyy', padLeft(year, 4)],
            ['yy', String(year).slice(2)],
            ['MM', padLeft(month, 2)],
            ['M', month],
            ['dddd', '星期' + ('日一二三四五六'.charAt(datetime.getDay()))],
            ['dd', padLeft(date, 2)],
            ['d', date],
            ['HH', padLeft(hour, 2)],
            ['H', hour],
            ['hh', padLeft(isAM ? hour : hour - 12, 2)],
            ['h', isAM ? hour : hour - 12],
            ['mm', padLeft(minute, 2)],
            ['m', minute],
            ['ss', padLeft(second, 2)],
            ['s', second],
            ['tt', isAM ? 'AM' : 'PM'],
            ['t', isAM ? 'A' : 'P'],
            ['TT', isAM ? '上午' : '下午'],
            ['T', isAM ? '上' : '下']
        ];


        let s = formater;

        maps.forEach(function (item, index) {
            s = $String.replaceAll(s, item[0], item[1]);
        });

        return s;
    },


    /**
    * 将指定的毫秒数加到指定的 Date 上。
    * 此方法不更改参数 datetime 的值，而是返回一个新的 Date，其值是此运算的结果。
    * @param {Date} datetime 要进行操作的日期时间。
    * @param {Number} value 要增加/减少的毫秒数。 
        可以为正数，也可以为负数。
    * @param {string} [formater] 可选的，对结果进行格式化的字符串。 
    * @return {Date|string} 返回一个新的日期实例或字符串值。
        如果指定了参数 formater，则进行格式化，返回格式化后的字符串值；
        否则返回 Date 的实例对象。
    * @example
        $Date.addMilliseconds(new Date(), 2000); //给当前时间加上2000毫秒
    */
    add(datetime, value, formater) {
        datetime = exports.parse(datetime);

        let ms = datetime.getMilliseconds();
        let dt = new Date(datetime);//新建一个副本，避免修改参数

        dt.setMilliseconds(ms + value);

        if (formater) {
            dt = exports.format(dt, formater);
        }

        return dt;
    },

    /**
    * 将指定的秒数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间实例。
    * @param {Number} value 要增加/减少的秒数。可以为正数，也可以为负数。
    * @param {string} [formater] 可选的，对结果进行格式化的字符串。 
    * @return {Date} 返回一个新的日期实例。
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $Date.addSeconds(new Date(), 90); //给当前时间加上90秒
    */
    addSeconds(datetime, value, formater) {
        return exports.add(datetime, value * 1000, formater);
    },

    /**
     * 将指定的分钟数加到指定的 Date 实例上。
     * @param {Date} datetime 要进行操作的日期时间实例。
     * @param {Number} value 要增加/减少的分钟数。可以为正数，也可以为负数。
     * @param {string} [formater] 可选的，对结果进行格式化的字符串。 
     * @return {Date} 返回一个新的日期实例。
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
     * @example
        $Date.addMinutes(new Date(), 90); //给当前时间加上90分钟
     */
    addMinutes(datetime, value, formater) {
        return exports.addSeconds(datetime, value * 60, formater);
    },

    /**
     * 将指定的小时数加到指定的 Date 实例上。
     * @param {Date} datetime 要进行操作的日期时间实例。
     * @param {Number} value 要增加/减少的小时数。可以为正数，也可以为负数。
     * @return {Date} 返回一个新的日期实例。
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
     * @example
        $Date.addHours(new Date(), 35); //给当前时间加上35小时
     */
    addHours(datetime, value, formater) {
        return exports.addMinutes(datetime, value * 60, formater);
    },


    /**
    * 将指定的天数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间实例。
    * @param {Number} value 要增加/减少的天数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。。
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $Date.addDays(new Date(), 35); //给当前时间加上35天
    */
    addDays(datetime, value, formater) {
        return exports.addHours(datetime, value * 24, formater);
    },

    /**
    * 将指定的周数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间实例。
    * @param {Number} value 要增加/减少的周数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。
        此方法不更改参数 datetime 的值。 而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $Date.addWeeks(new Date(), 3); //给当前时间加上3周
    */
    addWeeks(datetime, value, formater) {
        return exports.addDays(datetime, value * 7, formater);
    },

    /**
    * 将指定的月份数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间实例。
    * @param {Number} value 要增加/减少的月份数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。
        此方法不更改参数 datetime 的值。而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $Date.addMonths(new Date(), 15); //给当前时间加上15个月
    */
    addMonths(datetime, value, formater) {
        datetime = exports.parse(datetime);

        let dt = new Date(datetime);//新建一个副本，避免修改参数
        let old = datetime.getMonth();

        dt.setMonth(old + value);

        if (formater) {
            dt = exports.format(dt, formater);
        }

        return dt;
    },

    /**
    * 将指定的年份数加到指定的 Date 实例上。
    * @param {Date} datetime 要进行操作的日期时间实例。
    * @param {Number} value 要增加/减少的年份数。可以为正数，也可以为负数。
    * @return {Date} 返回一个新的日期实例。
        此方法不更改参数 datetime 的值。 而是返回一个新的 Date，其值是此运算的结果。
    * @example
        $Date.addYear(new Date(), 5); //假如当前时间是2013年，则返回的日期实例的年份为2018
    */
    addYears(datetime, value, formater) {
        return exports.addMonths(datetime, value * 12, formater);
    },

    /**
    * 设置一个参考时间在本地的初始值，随着时间的流逝，参考时间也会同步增长。
    * 如用来设置服务器时间在本地的初始值。
    * 
    */
    set(datetime) {
        let dt = exports.parse(datetime);

        if (!dt) {
            throw new Error('无法识别的日期时间格式: ' + datetime);
        }

        meta.delta = dt - Date.now();
    },

    /**
    * 获取之前设置的参考时间。
    */
    get(formater) {
        let dt = new Date();

        if (meta.delta != 0) {
            dt = exports.add(dt, meta.delta);
        }

        if (formater) {
            dt = exports.format(dt, formater);
        }

        return dt;
    },

    
};