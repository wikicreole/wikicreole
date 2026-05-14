function SortableParser() {

}

SortableParser.DEBUG = false;

SortableParser.TYPE_STRING = "string";
SortableParser.TYPE_NUMBER = "number";
SortableParser.TYPE_DATE = "date";
SortableParser.TYPE_IP4 = "ip4";
SortableParser.TYPE_MONEY = "money";
SortableParser.TYPE_BYTE = "byte";

SortableParserUtil = function() {
}

SortableParserUtil.compare = function(a, b, reverse) {
    var compareResult = 0;
    if (a < b) {
        compareResult = reverse ? 1 : -1;
    } else if (a > b) {
        compareResult = reverse ? -1 : 1;
    }
    SortableParser.debug("comparing: " + a + " - " + b + ": " + compareResult);
    return compareResult;
}

SortableParserUtil.appendPrototype = function(object, attributes) {
    for (key in attributes) {
        var value = attributes[key];
        object[key] = value;
    }
}

SortableParserBase = function() {
}
SortableParserBase.prototype = {

    ignore : function(value, defaultIgnore, ignore) {
        if (value.length == 0) {
            return true;
        }
        return ignore[value] || defaultIgnore[value];
    },

    compare : function(a, b, ignoreMap, reverse) {
        a = a.trim();
        b = b.trim();
        var ignore = SortableParserInstance.ignoreMap;
        if (this.ignore(a, ignoreMap, ignore)
                && this.ignore(b, ignoreMap, ignore)) {
            return 0;
        } else if (this.ignore(a, ignoreMap, ignore)) {
            return 1;
        } else if (this.ignore(b, ignoreMap, ignore)) {
            return -1;
        }
        var val1 = this.convert(a);
        var val2 = this.convert(b);
        var compareResult = SortableParserUtil.compare(val1, val2, reverse);
        return compareResult;
    }
}

SortableStringParser = function() {
}
SortableStringParser.prototype = new SortableParserBase();
SortableParserUtil.appendPrototype(SortableStringParser.prototype, {
    type : SortableParser.TYPE_STRING,

    isOfType : function(value) {
        return true;
    },

    convert : function(value) {
        value = value.toLowerCase();
        return value;
    }

});
SortableParser.prototype.stringParser = new SortableStringParser();

SortableParser.cleanNumber = function(value) {
    return value.replace(/[,]/g, '');
}

SortableNumberParser = function() {
}
SortableNumberParser.prototype = new SortableParserBase();
SortableParserUtil.appendPrototype(SortableNumberParser.prototype, {
    type : SortableParser.TYPE_NUMBER,

    isOfType : function(value) {
        value = SortableParser.cleanNumber(value);
        var isNumber = value.test(/^-?[0-9.,]+$/);
        return isNumber;
    },

    convert : function(value) {
        value = SortableParser.cleanNumber(value);
        return parseFloat(value.match(Number.REparsefloat));
    }
});
SortableParser.prototype.numberParser = new SortableNumberParser();

SortableMoneyParser = function() {
}
SortableMoneyParser.prototype = new SortableParserBase()
SortableParserUtil.appendPrototype(SortableMoneyParser.prototype, {
    type : SortableParser.TYPE_MONEY,

    isOfType : function(value) {
        value = SortableParser.cleanNumber(value);
        return value.test(/^[�$�][0-9.,]+/);
    },

    convert : function(value) {
        value = SortableParser.cleanNumber(value);
        return parseFloat(value.replace(/[^0-9.,]/g, ''));
    }
});
SortableParser.prototype.moneyParser = new SortableMoneyParser();

SortableDateParser = function() {
}
SortableDateParser.prototype = new SortableParserBase();
SortableParserUtil.appendPrototype(SortableDateParser.prototype, {
    type : SortableParser.TYPE_DATE,

    isOfType : function(value) {
        var isDate = !isNaN(Date.parse(value));
        // var isDate = value.test(/d{4}-\d{2}-d{2}/);
        SortableParser.debug("is " + value + " a date: " + isDate);
        return isDate;
    },

    convert : function(value) {
        return new Date(Date.parse(value));
    }
});
SortableParser.prototype.dateParser = new SortableDateParser();

SortableIpParser = function() {
}
SortableIpParser.prototype = new SortableParserBase();
SortableParserUtil.appendPrototype(SortableIpParser.prototype, {
    type : SortableParser.TYPE_IP4,

    isOfType : function(value) {
        return value.test(/(?:\d{1,3}\.){3}\d{1,3}/);
    },

    convert : function(value) {
        var octet = value.split(".");
        return parseInt(octet[0]) * 1000000000 + parseInt(octet[1]) * 1000000
                + parseInt(octet[2]) * 1000 + parseInt(octet[3]);
    }
});
SortableParser.prototype.ipParser = new SortableIpParser();

SortableByteParser = function() {
}
SortableByteParser.prototype = new SortableParserBase();
SortableParserUtil.appendPrototype(SortableByteParser.prototype,
        {
            type : SortableParser.TYPE_BYTE,

            isOfType : function(value) {
                value = SortableParser.cleanNumber(value);
                return value.test(/(?:[0-9.,]+)\s*(?:[kmgt])b/i);
            },

            convert : function(value) {
                value = SortableParser.cleanNumber(value);
                var v = value.toString().toLowerCase().match(
                        /([0-9.,]+)\s*([kmgt])b/i);
                if (!v)
                    return 0;
                var z = v[2];
                z = (z == 'm') ? 3 : (z == 'g') ? 6 : (z == 't') ? 9 : 0;
                return v[1].toFloat() * Math.pow(10, z);
            }
        });
SortableParser.prototype.byteParser = new SortableByteParser();

SortableParser.prototype.getParserArray = function() {
    var parsers = [ this.ipParser, this.byteParser, this.dateParser,
            this.numberParser, this.moneyParser, this.stringParser ];
    return parsers;
}

SortableParser.prototype.getComparator = function(rows, column, options,
        reverse, multi_column, headers, multi_columns) {
    if (options.customComparator) {
        return options.customComparator(rows, column, options, reverse,
                multi_column, headers, multi_columns);
    }
    return this.getComparatorFunction(rows, column, options, reverse,
            multi_column, headers, multi_columns);
}

SortableParser.prototype.getComparatorFunction = function(rows, column,
        options, reverse, multi_column, headers, multi_columns) {
    SortableParser.debug(headers);
    var parser = this.guessDataType(rows, column, options.getIgnoreMap());
    var sortableParser = this;
    return function(row1, row2) {
        var value1 = sortableParser.getValueAtColumnInRow(row1, column, options);
        var value2 = sortableParser.getValueAtColumnInRow(row2, column, options);
        
        if(multi_columns && multi_columns.length > 0)
        {
            var position = sortableParser.findColumnPositionInMultiColumns(multi_columns, column);
            for(var prev_position = position - 1; prev_position >= 0; prev_position--)
            {
                var prev_column = multi_columns[prev_position];
                var previous_value1 = sortableParser.getValueAtColumnInRow(row1, prev_column, options);
                var previous_value2 = sortableParser.getValueAtColumnInRow(row2, prev_column, options);
                if(previous_value1 != previous_value2)
                {
                    return sortableParser.getComparator(rows, prev_column, options,
        sortableParser.isColumnInReverse(headers, prev_column), true, headers, multi_columns)(row1, row2);
                }
            }
        }
        return parser.compare(value1, value2, options.getIgnoreMap(), reverse);
    };
}

SortableParser.prototype.findColumnPositionInMultiColumns = function(multi_columns, column)
{
    for(var position = 0; position < multi_columns.length; position++)
    {
        if(multi_columns[position] == column)
        {
            return position;
        }
    }
}

SortableParser.prototype.getValueAtColumnInRow = function(row, column, options)
{
    var cell = row.cells[column];
    var value = this.getValueFromCell(cell, options);
    return value;
}

SortableParser.prototype.getMultiColumnSortResult = function(rows, column,
        options, reverse, headers, row1, row2, value1, value2)
{
    var has_multi_column = headers[column].multiColumn;
    if(has_multi_column)
    {
        return undefined;
    }
}

SortableParser.prototype.isColumnInReverse = function(headers, column)
{
    var reverse_attribute = headers[column].getAttribute("reverse");
    var reverse = false;
    if (reverse_attribute != undefined
            && reverse_attribute != null) 
    {
        reverse = reverse_attribute == "true";
    }
    return reverse;
}

SortableParser.prototype.getValueFromCell = function(cell, options)
{
    var value = this.getValue(cell);
    if (options.valueCleaner) {
        value = options.valueCleaner(value);
    }
    return value;
}

SortableParser.prototype.hasTheColumnOnlyDifferentValues = function(rows, column_index, options)
{
    var different = true;
    for(var row_index = 0; row_index < rows.length; row_index++)
    {
        var row = rows[row_index];
        var cell = row.cells[column_index];
        var value = this.getValueFromCell(cell, options);
        for(var inner_index = 0; inner_index < rows.length; inner_index++)
        {
            if(inner_index == row_index)
            {
                continue;
            }
            var inner_row = rows[inner_index];
            var inner_cell = inner_row.cells[column_index];
            var inner_value = this.getValueFromCell(inner_cell, options);
            different = different && value != inner_value;
            if(!different)
            {
                break;
            }
        }
        if(!different)
        {
            break;
        }
    }
    return different;
}

SortableParser.prototype.getValue = function(column) {
    if(column == undefined)
    {
        return "";
    }
    return column.getAttribute('jspwiki:sortvalue') || $getText(column);
}

SortableParser.prototype.guessDataType = function(rows, column, ignoreMap) {
    var parsers = this.getParserArray();
    for (var i = 0; i < rows.length; i++) {
        var cell = rows[i].cells[column];
        var value = this.getValue(cell);
        value = value.trim();
        if (this.ignoreValue(value, ignoreMap)) {
            continue;
        }
        var new_parsers = [];
        for (var j = 0; j < parsers.length; j++) {
            var parser = parsers[j];
            if (parser.isOfType(value)) {
                new_parsers.push(parser);
            }
        }
        parsers = new_parsers;
        if (parsers.length == 1) {
            return parsers[0];
        }
    }
    ;
    return parsers[0];
}

SortableParser.prototype.ignoreValue = function(value, ignoreMap) {

    if (value.length == 0) {
        return true;
    }
    if (!this.ignoreMap) {
        var map = {};
        var ignoreValues = SortableParser.IGNORE_VALUES;
        for (var i = 0; i < ignoreValues.length; i++) {
            map[ignoreValues[i]] = true;
        }
        this.ignoreMap = map;
    }
    return this.ignoreMap[value] || ignoreMap[value];
}

SortableParser.debug = function(object)
{
    if(SortableParser.DEBUG)
    {
        var caller_line = (new Error).stack.split("\n")[2];
        var function_name = caller_line.split(" ")[5];
        var line_number = caller_line.split(":")[2];
        var now = new Date();
        var date_format = now.toUTCString();
        console.log("%s SortableParser.DEBUG %s - %s:", date_format, function_name, line_number);
        console.log(object);
    }
}

var SortableParserInstance = new SortableParser();
