class CalcControler {

    constructor() {

        this._audio = new Audio('static/audios/click.mp3');
        this._audioOnOff = false
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this._locale = 'pt-BR'
        this._displayCalcEl = document.querySelector('#display')
        this._dateEl = document.querySelector('#data')
        this._timeEl = document.querySelector('#hora')
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {

        if (value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    }

    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }

    get displayTime() {
        return this._timeEl.innerHTML;
    }

    set displayTime(value) {
        this._timeEl.innerHTML = value;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(value) {
        this._currentDate = value;
    }


    initialize() {

        this.setDisplayDateTime();

        setInterval(() => {

            this.setDisplayDateTime();

        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {

            btn.addEventListener('dblclick', e => {

                this.toggleAudio();

            });

        });

    }

    toggleAudio() {

        this._audioOnOff = !this._audioOnOff;

    }


    playAudio() {

        if (this._audioOnOff) {

            this._audio.play();

        }
    }

    addEventListenerAll(element, events, fn) {

        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);

        });

    }

    clearAll() {

        this._operation = [];
        this.setLastNumberToDisplay();
        this._lastOperator = '';
        this._lastNumber = '';

    }

    clearEntry() {

        this._operation.pop();
        this.setLastNumberToDisplay();

    }

    setError() {

        this.displayCalc = "Error";
        this._lastNumber = '0';
        this._lastOperator = '+';

    }

    getLastOperation() {

        return this._operation[this._operation.length - 1];

    }

    setLastOperation(value) {

        this._operation[this._operation.length - 1] = value;

    }

    pushOperation(value) {

        if (value == '%') {

            this._operation = [this.calcOp() / 100];

        } else if (this._operation.length == 3) {

            this._operation = [this.calcOp()];
            this._operation.push(value);

        } else {
            this._operation.push(value);
        }


        this.setLastNumberToDisplay();

    }

    calcOp() {

        try {
            return eval(this._operation.join(""));
        } catch (e) {
            setTimeout(() => {
                this.setError();
            }, 1);

        }

    }

    isOperator(value) {
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    setLastNumberToDisplay() {

        let lastNumber;

        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (!this.isOperator(this._operation[i])) {

                lastNumber = this._operation[i];
                break;

            }
        }

        if (!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    addOperation(value) {

        if (isNaN(this.getLastOperation())) {

            if (this.isOperator(value)) {

                if (this.isOperator(this.getLastOperation())) {

                    this.setLastOperation(value);

                } else {
                    this.pushOperation(value);
                }

            } else {
                this.pushOperation(value)
                this.setLastNumberToDisplay();
            }

        } else {

            if (this.isOperator(value)) {

                this.pushOperation(value);

            } else {

                // number
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();
            }
        }

    }

    setIgualOperation() {

        if (this._operation.length == 3) {


            for (let i = this._operation.length - 1; i >= 0; i--) {

                if (!this.isOperator(this._operation[i])) {

                    this._lastNumber = this._operation[i];

                } else {

                    this._lastOperator = this._operation[i];
                    break;

                }
            }

            this._operation = [this.calcOp()];
            this.setLastNumberToDisplay();

        } else if (this._operation.length == 1) {
            this._operation = [eval([this._operation[0], this._lastOperator, this._lastNumber].join(""))];
            this.setLastNumberToDisplay();

        } else if (this._operation.length == 2) {
            this._lastOperator = this._operation[1];
            this._operation = [eval([this._operation[0], this._lastOperator, this._operation[0]].join(""))];
            this._lastOperator = this._operation[1];
            this.setLastNumberToDisplay();

        } else {
            this.setError();
        }

    }

    addDot() {

        let lastOp = this.getLastOperation();

        if (typeof lastOp === 'string' && lastOp.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOp) || !lastOp) {

            this.pushOperation('0.');

        } else {
            this.setLastOperation(lastOp.toString() + '.');
        }

        this.setLastNumberToDisplay();

    }

    excBtn(value) {

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.setIgualOperation();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }

    }

    copyToClipboard() {

        let input = document.createElement('input');

        input.value = this.displayCalc;
        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    pasteFromClipboard() {

        document.addEventListener('paste', e => {

            let text = e.clipboardData.getData('text');

            this.displayCalc = parseFloat(text);

        });

    }

    initKeyboard() {
        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.setIgualOperation();
                    break;

                case '.':
                case ',':
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });
    }

    initButtonsEvents() {

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn, "click drag", e => {

                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.excBtn(textBtn);

            });


            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {

                btn.style.cursor = "pointer";
            });

        });

    }

    setDisplayDateTime() {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }


};