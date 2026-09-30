import { useState, useRef } from 'react';
import Styles from './Output.module.css';

const codeTemplate = {
    true: 'T    ',
    false: 'WRONG',
    initialProcs: `proc import datafile="replace with path/ddfilename.csv"\n   out=data\n   dbms=csv\n   replace;\n   guessingrows=max;\nrun;`,
    endProcs: `\n\nproc export data=data\n   outfile="replace with path/outfilename.xlsx"\n   dbms=xlsx\n   replace;\nrun;\n\n*Note for Data Team: replace or add variables in the "Tables" portion to see frequencies for the variables you need; \n\n/*\nproc freq data=data;\nTables Q1 Q2; \nrun;\n*/`,
    midProcs1: `\n\nrun;\n\nTITLE "Logic Code Summary";\n\nproc sql;\n`,
    midProcs3: `\nfrom data;\nquit;`,
    finalCheck:''
};

const parseArraySubcodes = subQuestionsStr => {
    let parsedsubQArr = subQuestionsStr.split(/,\s*(?![^()]*\))/);
    let subqarrArr = [];
    for (let i = 0; i < parsedsubQArr.length; i++) {
        if (
            parsedsubQArr[i].includes(':') &&
            !(parsedsubQArr[i].includes('(') || parsedsubQArr[i].includes(')'))
        ) {
            let values = parsedsubQArr[i].trim().split(':');
            let startVal = null;
            let endVal = null;
            if (
                values[0].length === 1 &&
                values[0].toLowerCase().match(/[a-z]/i) &&
                values[1].length === 1 &&
                values[1].toLowerCase().match(/[a-z]/i)
            ) {
                startVal = values[0].toLowerCase().charCodeAt(0);
                endVal = values[1].toLowerCase().charCodeAt(0);
                for (let itr = startVal; itr <= endVal; itr++) {
                    subqarrArr.push(String.fromCharCode(itr));
                }
            } else {
                startVal = Number(values[0]);
                endVal = Number(values[1]);
                for (let itr = startVal; itr <= endVal; itr++) {
                    subqarrArr.push(itr.toString());
                }
            }
        } else {
            subqarrArr.push(parsedsubQArr[i].toLowerCase().trim());
        }
    }
    return subqarrArr;
};

const Output = props => {
    const [finalCode, updateFinalCode] = useState(codeTemplate.initialProcs);
    const ref = useRef(null);
    let code = '\n\ndata data; set data;\n\n';
    let datacodes='';
    codeTemplate.midProcs2 = `select distinct `;

    let demoRefusalItems = [];
    for (let key in Object.keys(props.questionsList)) {
        const q = props.questionsList[key];
        const qType = q.questionType;
        const qCode = (q.questionCode || '').trim();

        if (qType === 'radio/equation' && q.demoRefusalTitle && q.demoRefusalPunch) {
            demoRefusalItems.push({
                titleText: q.demoRefusalTitle.trim(),
                questionNumber: qCode,
                answerOptions: q.demoRefusalPunch.split(',').map(v => v.trim()),
            });
        }
        if (qType === 'mcq' && q.demoRefusalTitle && q.demoRefusalSubQ) {
            demoRefusalItems.push({
                titleText: q.demoRefusalTitle.trim(),
                questionNumber: `${qCode}_${q.demoRefusalSubQ.trim()}`,
                answerOptions: ['1'],
            });
        }
        if (qType === 'array' && q.demoRefusalTitle && q.demoRefusalPunch) {
            let subcodes = parseArraySubcodes((q.subQuestions || '').trim());
            let punches = q.demoRefusalPunch.split(',').map(v => v.trim());
            subcodes.forEach(subq => {
                let cleanSubq = subq.includes('[') ? subq.split('[')[0].trim() : subq;
                demoRefusalItems.push({
                    titleText: `${q.demoRefusalTitle.trim()}_${cleanSubq}`,
                    questionNumber: `${qCode}${cleanSubq}`,
                    answerOptions: punches,
                });
            });
        }
        if (qType === 'customcode' && q.demoRefusals) {
            const pattern = /([^[]+)\[([^|]+)\|([^\]]+)\]/;
            const titleItems = q.demoRefusals.trim().split(/,(?![^\[\]]*\])/);
            titleItems.forEach(item => {
                const match = item.match(pattern);
                if (match) {
                    demoRefusalItems.push({
                        titleText: match[1].trim(),
                        questionNumber: match[2].trim(),
                        answerOptions: match[3].split(',').map(v => v.trim()),
                    });
                }
            });
        }
    }

    for (let key in Object.keys(props.questionsList)) {
        let {
            questionType,
            questionCode,
            answerOptions,
            skipLogic,
            extraCondition,
            otherCode,
            exclusiveOption,
            subQuestions,
            customCode,
            minMax,
            oldLogic,
            newLogic,
            changeDate,
            langQ
        } = props.questionsList[key];

        questionCode = questionCode.trim();
        answerOptions = answerOptions.trim();
        skipLogic = skipLogic.trim();
        extraCondition = (extraCondition || '').trim();
        otherCode = Number(otherCode.trim());
        exclusiveOption = exclusiveOption.trim();
        subQuestions = subQuestions.trim();
        oldLogic = oldLogic.trim();
        changeDate = changeDate.trim();
        newLogic = newLogic.trim();
        langQ=langQ.trim();

        let modeOptions = answerOptions.split('|');
        let modeSwitch = modeOptions.length > 1;
        let minMaxarr = minMax.trim().split(',');

        switch (questionType) {
            case 'radio/equation': {
                const getRadioExpr = (opts, modeCond) => {
                    let expr = '';
                    if (!opts.includes('[')) {
                         expr = `${questionCode} in (${opts})`;
                    } else {
                         let optionsArr = opts.split(/,\s*(?![^\[]*\])/);
                         let parts = [];
                         optionsArr.forEach(opt => {
                             opt = opt.trim();
                             if (opt.includes('[')) {
                                 let [val, logic] = opt.split('[');
                                 logic = logic.replace(']', '').trim();
                                 parts.push(`(${questionCode} in (${val.trim()}) & ${logic})`);
                             } else {
                                 parts.push(`(${questionCode} in (${opt}))`);
                             }
                         });
                         expr = `(${parts.join(' OR ')})`;
                    }

                    if (otherCode) {
                        expr = `((${questionCode}_other~="" & ${questionCode}=${otherCode}) OR (${expr} & ${questionCode}_other=""))`;
                    }

                    if (modeCond) {
                        expr = `(${modeCond} & ${expr})`;
                    }
                    return expr;
                };

                let modeExprs = [];
                if (modeSwitch) {
                    if (modeOptions.length === 2) {
                        modeExprs.push(getRadioExpr(modeOptions[0], 'pMode=1'));
                        modeExprs.push(getRadioExpr(modeOptions[1], 'pMode>1'));
                    } else {
                        modeExprs.push(getRadioExpr(modeOptions[0], 'pMode=1'));
                        modeExprs.push(getRadioExpr(modeOptions[1], 'pMode=2'));
                        modeExprs.push(getRadioExpr(modeOptions[2], 'pMode=3'));
                    }
                } else {
                    modeExprs.push(getRadioExpr(answerOptions, null));
                }

                let combinedExpr = modeExprs.join(' OR ');
                let extraCond = extraCondition ? ` & (${extraCondition})` : '';

                if (skipLogic) {
                    let nullCheck = otherCode
                        ? `${questionCode}="" & ${questionCode}_other=""`
                        : `${questionCode}=""`;

                    code += `if (${skipLogic}) & (${combinedExpr})${extraCond} then ${questionCode}_final="${codeTemplate.true}"; \nelse if ~(${skipLogic}) & ${nullCheck} then ${questionCode}_final="${codeTemplate.true}";\nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                } else {
                    code += `if (${combinedExpr})${extraCond} then ${questionCode}_final="${codeTemplate.true}"; \nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                }

                codeTemplate.midProcs2 += `, ${questionCode}_final`;
                break;
            }
            case 'sft':
                if (!skipLogic) {
                    code =
                        code +
                        `if ${questionCode}~="" then ${questionCode}_final="${codeTemplate.true}"; \nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                    codeTemplate.midProcs2 += `, ${questionCode}_final`;
                } else {
                    code =
                        code +
                        `if (${skipLogic}) & ${questionCode}~="" then ${questionCode}_final="${codeTemplate.true}"; \nelse if ~(${skipLogic}) & ${questionCode}="" then ${questionCode}_final="${codeTemplate.true}";\nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                    codeTemplate.midProcs2 += `, ${questionCode}_final`;
                }
                break;
            case 'mcq':
                let subqstr = subQuestions;
                let min = '';
                let max = '';
                if (minMaxarr.length > 1) {
                    min = minMaxarr[0].trim() ? minMaxarr[0] : '1';
                    max = minMaxarr[1].trim();
                } else {
                    min = minMaxarr[0].trim() ? minMaxarr[0] : '1';
                }

                let parsedsubQ = subqstr.split(/,\s*(?![^\[]*\])/);
                let subqarrObj = [];

                for (let i = 0; i < parsedsubQ.length; i++) {
                    let subqItem = parsedsubQ[i].trim();
                    let condition = null;
                    let punchVal = subqItem;

                    if (subqItem.includes('[')) {
                        let parsedLogic = subqItem.split('[');
                        punchVal = parsedLogic[0].trim();
                        condition = parsedLogic[1].split(']')[0].trim();
                    }

                    if (punchVal.includes(':')) {
                        let values = punchVal.split(':');
                        let startVal = Number(values[0]);
                        let endVal = Number(values[1]);
                        for (let itr = startVal; itr <= endVal; itr++) {
                            subqarrObj.push({ punch: itr, condition: null });
                        }
                    } else {
                        let nPunch = Number(punchVal);
                        if (!subqarrObj.some(sq => sq.punch === nPunch)) {
                            subqarrObj.push({ punch: nPunch, condition: condition });
                        }
                    }
                }

                if (otherCode) {
                    if (!subqarrObj.some(sq => sq.punch === otherCode)) {
                        subqarrObj.push({ punch: otherCode, condition: null });
                    }
                    code =
                        code +
                        `if ${questionCode}_other~="" & ${questionCode}_${otherCode}=1 then ${questionCode}_other_final="${codeTemplate.true}"; \nelse if ${questionCode}_other="" & ${questionCode}_${otherCode}="" then ${questionCode}_other_final="${codeTemplate.true}"; \nelse ${questionCode}_other_final="${codeTemplate.false}"; \n\n`;
                    codeTemplate.midProcs2 += ` ,${questionCode}_other_final`
                }

                let excArr = [];
                if (exclusiveOption) {
                    let parsedExc = exclusiveOption.split(/,\s*(?![^\[]*\])/);
                    parsedExc.forEach(excItem => {
                        excItem = excItem.trim();
                        let excCondition = null;
                        let excPunchVal = excItem;

                        if (excItem.includes('[')) {
                            let parsedExcLogic = excItem.split('[');
                            excPunchVal = parsedExcLogic[0].trim();
                            excCondition = parsedExcLogic[1].split(']')[0].trim();
                        }

                        let nExcPunch = Number(excPunchVal);
                        excArr.push(nExcPunch);

                        let existingSq = subqarrObj.find(sq => sq.punch === nExcPunch);
                        if (!existingSq) {
                            subqarrObj.push({ punch: nExcPunch, condition: excCondition });
                        } else if (excCondition && !existingSq.condition) {
                            existingSq.condition = excCondition;
                        }
                    });
                }

                let sumstr = `sum${questionCode}=sum(`;
                let checkstr = '';
                for (let i = 0; i < subqarrObj.length; i++) {
                    let currentPunch = subqarrObj[i].punch;
                    let currentCond = subqarrObj[i].condition;
                    sumstr = sumstr + `${questionCode}_${currentPunch}`;

                    if (currentCond) {
                        checkstr += `if (${questionCode}_${currentPunch}="" OR (${currentCond} & ${questionCode}_${currentPunch}=1)) then ${questionCode}_${currentPunch}_final="${codeTemplate.true}";\nelse ${questionCode}_${currentPunch}_final="${codeTemplate.false}";\n\n`;
                    } else {
                        checkstr += `if (${questionCode}_${currentPunch}="" OR ${questionCode}_${currentPunch}=1) then ${questionCode}_${currentPunch}_final="${codeTemplate.true}";\nelse ${questionCode}_${currentPunch}_final="${codeTemplate.false}";\n\n`;
                    }

                    codeTemplate.midProcs2 += `, ${questionCode}_${currentPunch}_final`;
                    if (i < subqarrObj.length - 1) {
                        sumstr = sumstr + ',';
                    } else {
                        sumstr = sumstr + `);\n\n`;
                    }
                }
                code = code + checkstr;
                code = code + sumstr;
                if (skipLogic) {
                    let expression = '';
                    if (exclusiveOption) {
                        let firstexpression = '';
                        expression = '(';
                        for (let i = 0; i < excArr.length; i++) {
                            if (i < excArr.length - 1) {
                                firstexpression += `(${questionCode}_${excArr[i]}=1 & sum${questionCode}=1) OR `;
                                expression += `${questionCode}_${excArr[i]}~=1 & `;
                            } else {
                                firstexpression += `(${questionCode}_${excArr[i]}=1 & sum${questionCode}=1) OR `;
                                expression += `${questionCode}_${excArr[i]}~=1 & ${
                                    max ? max + '>=' : ''
                                }sum${questionCode}>=${min})`;
                            }
                        }
                        expression = firstexpression + expression;
                    } else {
                        expression = `${max ? max + '>=' : ''}sum${questionCode}>=${min}`;
                    }
                    codeTemplate.midProcs2 += `, ${questionCode}_final`;
                    code =
                        code +
                        `if (${skipLogic}) & (${expression}) then ${questionCode}_final="${codeTemplate.true}";\nelse if ~(${skipLogic}) & sum${questionCode}="" then ${questionCode}_final="${codeTemplate.true}";\nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                } else {
                    let expression = '';
                    if (exclusiveOption) {
                        let firstexpression = '';
                        expression = '(';
                        for (let i = 0; i < excArr.length; i++) {
                            if (i < excArr.length - 1) {
                                firstexpression += `(${questionCode}_${excArr[i]}=1 & sum${questionCode}=1) OR `;
                                expression += `${questionCode}_${excArr[i]}~=1 & `;
                            } else {
                                firstexpression += `(${questionCode}_${excArr[i]}=1 & sum${questionCode}=1) OR `;
                                expression += `${questionCode}_${excArr[i]}~=1 & ${
                                    max ? max + '>=' : ''
                                }sum${questionCode}>=${min})`;
                            }
                        }
                        expression = firstexpression + expression;
                    } else {
                        expression = `${max ? max + '>=' : ''}sum${questionCode}>=${min}`;
                    }
                    codeTemplate.midProcs2 += `, ${questionCode}_final`;
                    code =
                        code +
                        `if (${expression}) then ${questionCode}_final="${codeTemplate.true}";\nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                }
                break;
            case 'array':
                let subqstrArr = subQuestions;
                let subqarrArr = parseArraySubcodes(subqstrArr);
                if (skipLogic) {
                    for (let i = 0; i < subqarrArr.length; i++) {
                        if (subqarrArr[i].includes('[')) {
                            let parsedQcode = subqarrArr[i].split('[');
                            let qcode = parsedQcode[0].trim();
                            let skLogic = parsedQcode[1].split(']')[0].trim();
                            if (modeSwitch) {
                                if (modeOptions.length === 2) {
                                    code =
                                        code +
                                        `if (${skipLogic} & ${skLogic}) & ((pMode=1 & ${questionCode + qcode} in (${
                                            modeOptions[0]
                                        })) OR (pMode>1 & ${questionCode + qcode} in (${modeOptions[1]}))) then ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.true}"; \nelse if ~(${skipLogic} & ${skLogic}) & ${
                                            questionCode + qcode
                                        }="" then ${questionCode + qcode}_final="${codeTemplate.true}";\nelse ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.false}";\n\n`;
                                } else {
                                    code =
                                        code +
                                        `if (${skipLogic} & ${skLogic}) & ((pMode=1 & ${questionCode + qcode} in (${
                                            modeOptions[0]
                                        })) OR (pMode=2 & ${questionCode + qcode} in (${
                                            modeOptions[1]
                                        })) OR (pMode=3 & ${questionCode + qcode} in (${modeOptions[2]}))) then ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.true}"; \nelse if ~(${skipLogic} & ${skLogic}) & ${
                                            questionCode + qcode
                                        }="" then ${questionCode + qcode}_final="${codeTemplate.true}";\nelse ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.false}";\n\n`;
                                }
                            } else {
                                code =
                                    code +
                                    `if (${skipLogic} & ${skLogic}) & ${
                                        questionCode + qcode
                                    } in (${answerOptions}) then ${questionCode + qcode}_final="${
                                        codeTemplate.true
                                    }"; \nelse if ~(${skipLogic} & ${skLogic}) & ${questionCode + qcode}="" then ${
                                        questionCode + qcode
                                    }_final="${codeTemplate.true}";\nelse ${questionCode + qcode}_final="${
                                        codeTemplate.false
                                    }";\n\n`;
                            }
                            codeTemplate.midProcs2 += `, ${questionCode + qcode}_final`;
                        } else {
                            if (modeSwitch) {
                                if (modeOptions.length === 2) {
                                    code =
                                        code +
                                        `if (${skipLogic}) & ((pMode=1 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[0]
                                        })) OR (pMode>1 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[1]
                                        }))) then ${questionCode + subqarrArr[i]}_final="${
                                            codeTemplate.true
                                        }"; \nelse if ~(${skipLogic}) & ${questionCode + subqarrArr[i]}="" then ${
                                            questionCode + subqarrArr[i]
                                        }_final="${codeTemplate.true}";\nelse ${questionCode + subqarrArr[i]}_final="${
                                            codeTemplate.false
                                        }";\n\n`;
                                } else {
                                    code =
                                        code +
                                        `if (${skipLogic}) & ((pMode=1 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[0]
                                        })) OR (pMode=2 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[1]
                                        })) OR (pMode=3 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[2]
                                        }))) then ${questionCode + subqarrArr[i]}_final="${
                                            codeTemplate.true
                                        }"; \nelse if ~(${skipLogic}) & ${questionCode + subqarrArr[i]}="" then ${
                                            questionCode + subqarrArr[i]
                                        }_final="${codeTemplate.true}";\nelse ${questionCode + subqarrArr[i]}_final="${
                                            codeTemplate.false
                                        }";\n\n`;
                                }
                            } else {
                                code =
                                    code +
                                    `if (${skipLogic}) & ${questionCode + subqarrArr[i]} in (${answerOptions}) then ${
                                        questionCode + subqarrArr[i]
                                    }_final="${codeTemplate.true}"; \nelse if ~(${skipLogic}) & ${
                                        questionCode + subqarrArr[i]
                                    }="" then ${questionCode + subqarrArr[i]}_final="${codeTemplate.true}";\nelse ${
                                        questionCode + subqarrArr[i]
                                    }_final="${codeTemplate.false}";\n\n`;
                            }
                            codeTemplate.midProcs2 += `, ${questionCode + subqarrArr[i]}_final`;
                        }
                    }
                } else {
                    for (let i = 0; i < subqarrArr.length; i++) {
                        if (subqarrArr[i].includes('[')) {
                            let parsedQcode = subqarrArr[i].split('[');
                            let qcode = parsedQcode[0].trim();
                            let skLogic = parsedQcode[1].split(']')[0].trim();
                            if (modeSwitch) {
                                if (modeOptions.length === 2) {
                                    code =
                                        code +
                                        `if (${skLogic}) & ((pMode=1 & ${questionCode + qcode} in (${
                                            modeOptions[0]
                                        })) OR (pMode>1 & ${questionCode + qcode} in (${modeOptions[1]}))) then ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.true}"; \nelse if ~(${skLogic}) & ${
                                            questionCode + qcode
                                        }="" then ${questionCode + qcode}_final="${codeTemplate.true}";\nelse ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.false}";\n\n`;
                                } else {
                                    code =
                                        code +
                                        `if (${skLogic}) & ((pMode=1 & ${questionCode + qcode} in (${
                                            modeOptions[0]
                                        })) OR (pMode=2 & ${questionCode + qcode} in (${
                                            modeOptions[1]
                                        })) OR (pMode=3 & ${questionCode + qcode} in (${modeOptions[2]}))) then ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.true}"; \nelse if ~(${skLogic}) & ${
                                            questionCode + qcode
                                        }="" then ${questionCode + qcode}_final="${codeTemplate.true}";\nelse ${
                                            questionCode + qcode
                                        }_final="${codeTemplate.false}";\n\n`;
                                }
                            } else {
                                code =
                                    code +
                                    `if (${skLogic}) & ${questionCode + qcode} in (${answerOptions}) then ${
                                        questionCode + qcode
                                    }_final="${codeTemplate.true}"; \nelse if ~(${skLogic}) & ${
                                        questionCode + qcode
                                    }="" then ${questionCode + qcode}_final="${codeTemplate.true}";\nelse ${
                                        questionCode + qcode
                                    }_final="${codeTemplate.false}";\n\n`;
                            }
                            codeTemplate.midProcs2 += `, ${questionCode + qcode}_final`;
                        } else {
                            if (modeSwitch) {
                                if (modeOptions.length === 2) {
                                    code =
                                        code +
                                        `if ((pMode=1 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[0]
                                        })) OR (pMode>1 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[1]
                                        }))) then ${questionCode + subqarrArr[i]}_final="${codeTemplate.true}";\nelse ${
                                            questionCode + subqarrArr[i]
                                        }_final="${codeTemplate.false}";\n\n`;
                                } else {
                                    code =
                                        code +
                                        `if ((pMode=1 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[0]
                                        })) OR (pMode=2 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[1]
                                        })) OR (pMode=3 & ${questionCode + subqarrArr[i]} in (${
                                            modeOptions[2]
                                        }))) then ${questionCode + subqarrArr[i]}_final="${codeTemplate.true}";\nelse ${
                                            questionCode + subqarrArr[i]
                                        }_final="${codeTemplate.false}";\n\n`;
                                }
                            } else {
                                code =
                                    code +
                                    `if ${questionCode + subqarrArr[i]} in (${answerOptions}) then ${
                                        questionCode + subqarrArr[i]
                                    }_final="${codeTemplate.true}";\nelse ${questionCode + subqarrArr[i]}_final="${
                                        codeTemplate.false
                                    }";\n\n`;
                            }
                            codeTemplate.midProcs2 += `, ${questionCode + subqarrArr[i]}_final`;
                        }
                    }
                }
                break;
            case 'customcode':
                code = code + customCode.trim() + `\n\n`;
                if (questionCode) {
                    let qcodes = questionCode.split(',');
                    if (qcodes.length >= 1) {
                        for (let i = 0; i < qcodes.length; i++) {
                            codeTemplate.midProcs2 += `, ${qcodes[i].trim()}_final`;
                        }
                    }
                }
                break;
            case 'midfieldchange':
                code += `submitDatetonum=input(put(submitdate,yymmddn8.),8.);\n\nif (submitDatetonum < ${changeDate} ) & (${oldLogic}) then ${questionCode}_final="${codeTemplate.true}";\nelse if ~(submitDatetonum < ${changeDate}) & (${newLogic}) then ${questionCode}_final="${codeTemplate.true}";\nelse ${questionCode}_final="${codeTemplate.false}";\n\n`;
                break;
            case 'datacodes':
                let percentages='';
                let constantZero='';
                let constantOne='';
                let columns='';
                let titles='';
                let constantTwo='';
                let styling='';
                let constantThree='';
                datacodes+=`\n\nproc sort data=data out=data;\nby token;\nrun;\n\ndata data; set data;\nby token;\nif first.token=1 and last.token=1 then Duplicate_Check_Token="T    ";\nelse Duplicate_Check_Token="WRONG";\nrun;\n\nproc sort data=data out=data;\nby id;\nrun;\n\ndata data; set data;\nby id;\nif first.id=1 and last.id=1 then Duplicate_Check_ID="T    ";\nelse Duplicate_Check_ID="WRONG";\n\nif token=Unique_ID then Unique_ID_Check="T    ";\nelse Unique_ID_Check="WRONG";\n\nrun;\n\nTITLE "Duplicate Checks for Token & ID. Unique_ID_Check is to check if tokens = Unique_ID";\n\nproc sql;\nselect distinct Duplicate_Check_Token, Duplicate_Check_ID, Unique_ID_Check\nfrom data;\nquit;\n\n*summary of dates using date*day_of_week crosstab;\n\n*note for DATA team: the dates need to be in the standard date format. Numeric or string date formats will only output the counts, but not the day of week;\n\ndata data;\n  set data;\n  day_of_week = put(submitdate, downame.);\nrun;\n\nproc freq data=data;\nTITLE "Submit Date Summary";\ntables submitdate*day_of_week / nocum nopercent norow nocol;\nrun;\n`;
                if(langQ){
                    datacodes+=`\n\n%let language_question=${langQ};\n\nproc freq data=data;\n  tables &language_question / noprint out=data_lang;\nrun;\n\n%let languages_submitted = ;\n\nproc sql noprint;\n   select count(*) into :languages_submitted\n   from data_lang;\nquit;\n\ndata data_lang;\n  set data_lang;\n\nif &languages_submitted = 0 then Language_Warning= "No Languages Submitted.                                                             ";\nif &languages_submitted > 1 then Language_Warning= "Multiple languages submitted. Check if we have QST for the languages submitted.     ";\nif &languages_submitted = 1 then Language_Warning= "Only one language submitted. Check if language QST is received and submit as needed.";\n\nrun;\n\nTITLE "Language Check";\n\nproc sql;\nselect distinct Language_Warning\nfrom data_lang;\nquit;`
                }
                if(demoRefusalItems.length > 0){
                    const refusals = demoRefusalItems;
                    percentages='\n\n';
                    constantZero='*demo refusals;\n\n%let n_size = ; \n\nproc sql noprint;\n   select count(*) into :n_size\n   from data;\nquit;\n\ndata data;\n  set data end=last_observation;'
                    constantOne='\n\nrun;\n\ndata data; set data end=last_observation;\nif last_observation =1 then unhidden=1;\nrun;\n\nTITLE "Demo Refusals Summary";\n\nproc report data=data nowd;'
                    columns='\n\ncolumn ';
                    titles='\n\n';
                    constantTwo='\n\nwhere unhidden=1;'
                    styling='\n\n';
                    constantThree='\n\nrun;';

                    refusals.forEach(item => {
                        percentages+=`if ${item.questionNumber} in (${item.answerOptions.join(',')}) then ${item.questionNumber}_refusal + 1;\n${item.questionNumber}_refusal_percent=cat(${item.questionNumber}_refusal/&n_size*100,"%");\n\n`
                        columns+=` ${item.questionNumber}_refusal_percent`;
                        titles+=`define ${item.questionNumber}_refusal_percent / '${item.titleText}';\n`
                        styling+=`compute ${item.questionNumber}_refusal_percent;\n   NumericValue = input(compress(${item.questionNumber}_refusal_percent, '%'), best12.);\n      if NumericValue >= 3 then\n         call define(_col_, "style", "style={background=rose}");\n      else\n         call define(_col_, "style", "style={background=lime}");\nendcomp;\n\n`
                    })
                }
                datacodes+=constantZero+percentages+constantOne+columns+`${columns===''?'':';'}`+titles+constantTwo+styling+constantThree
                break;
            default:
                break;
        }
    }
    codeTemplate.finalCheck='';
    if (codeTemplate.midProcs2.length > 25) {
        codeTemplate.midProcs2 = codeTemplate.midProcs2.replace(',', '');
        let removedDistinct=codeTemplate.midProcs2.split('select distinct ');
        let convertedString=''
        codeTemplate.finalCheck=removedDistinct[1].split(',');
        codeTemplate.finalCheck.forEach((item,index) => {
           if(index<codeTemplate.finalCheck.length-1) {
                convertedString+=item+`="T    " & `
            } else {
                convertedString+=item+`="T    "`
            }
        })
        codeTemplate.finalCheck=`if (${convertedString}) then Final="All Good";\nelse Final="Not Okay";`;
        codeTemplate.midProcs2='select distinct '+codeTemplate.midProcs2.split('select distinct ').join('Final,')    
        }
        codeTemplate.midprocs = codeTemplate.midProcs1 + codeTemplate.midProcs2 + codeTemplate.midProcs3;

    const handleCopyString = data => {
        const textField = document.createElement('textarea');
        textField.textContent = data;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        document.body.removeChild(textField);
    };

    return (
        <div className={Styles.OutputContainer}>
            <span className={Styles.OutputSpan}>SAS Code:</span>
            <textarea
                ref={ref}
                className={Styles.OutputTextArea}
                value={finalCode + code + codeTemplate.finalCheck + codeTemplate.midprocs + datacodes + codeTemplate.endProcs}
                readOnly
            ></textarea>
            <button
                className={Styles.CopyAllButton}
                onClick={() => handleCopyString(finalCode + code + codeTemplate.finalCheck + codeTemplate.midprocs + datacodes + codeTemplate.endProcs)}
            >
                Copy All
            </button>
            <button className={Styles.CopySomeButton} onClick={() => handleCopyString(code + codeTemplate.finalCheck + codeTemplate.midprocs + datacodes)}>
                Copy Logic Codes
            </button>
        </div>
    );
};

export default Output;
