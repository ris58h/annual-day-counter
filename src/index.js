import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Day({value, selected, onClick}) {
    return (
        <button className={'day' + (selected ? ' selected' : '')} onClick={onClick}>
            {value}
        </button>
    );
}

function Month({year, month, selectedDays, onDayClick}) {
    function renderDay(day, key) {
        const selected = selectedDays?.has(day);

        return (
            <Day
                key={key}
                value={day}
                selected={selected}
                onClick={() => onDayClick(day)}
            />
        );
    }

    function renderEmptyDay(key) {
        return (
            <div className='day' key={key} />
        );
    }

    function renderWeek(days, key) {
        return (
            <div className='week' key={key}>
                {days}
            </div>
        );
    }

    const daysBefore = new Date(year, month).getDay() - 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const weeksInMonth = Math.ceil((daysBefore + daysInMonth) / 7);
    const weeks = [];
    let days = [];
    for (let i = 1; i <= weeksInMonth * 7; i++) {
        const day = (i <= daysBefore || i > daysBefore + daysInMonth)
            ? renderEmptyDay(i)
            : renderDay(i - daysBefore, i);
        days.push(day);
        if (days.length === 7) {
            weeks.push(renderWeek(days, i));
            days = [];
        }
    }

    return (
        <div className='month'>
            <div className='week'>
                <div className='day'>Mon</div>
                <div className='day'>Tue</div>
                <div className='day'>Wed</div>
                <div className='day'>Thu</div>
                <div className='day'>Fri</div>
                <div className='day'>Sat</div>
                <div className='day'>Sun</div>
            </div>
            {weeks}
        </div>
    );
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function MonthSwitcher({month, onPrevMonth, onNextMonth}) {
    return (
        <div className='month-switcher'>
            <button onClick={onPrevMonth}>{'<'}</button>
            <span>{MONTH_NAMES[month]}</span>
            <button onClick={onNextMonth}>{'>'}</button>
        </div>
    );
}

function YearSwitcher({year, onPrevYear, onNextYear}) {
    return (
        <div className='year-switcher'>
            <button onClick={onPrevYear}>{'<'}</button>
            <span>{year}</span>
            <button onClick={onNextYear}>{'>'}</button>
        </div>
    );
}

function Counters({year, selectedDays}) {
    const selectedCount = countSelectedDays();
    const unselectedCount = daysInYear(year) - selectedCount;

    return (
        <div className='counters'>
            <span className='counters__selected'>{selectedCount}</span>
            <span className='counters__unselected'>{unselectedCount}</span>
        </div>
    );

    function countSelectedDays() {
        if (!selectedDays) {
            return 0;
        }
        let res = 0;
        for (let selectedMonthDays of selectedDays.values()) {
            res += selectedMonthDays.size;
        }
        return res;
    }
}

function Calendar() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selectedDays, setSelectedDays] = useState(new Map());

    return (
        <div className='calendar'>
            <YearSwitcher
                year={year}
                onPrevYear={() => setYear(year - 1)}
                onNextYear={() => setYear(year + 1)}
            />
            <MonthSwitcher
                year={year}
                month={month}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
            />
            <Month
                year={year}
                month={month}
                selectedDays={selectedDays.get(year)?.get(month)}
                onDayClick={handleDayClick}
            />
            <Counters
                year={year}
                selectedDays={selectedDays.get(year)}
            />
        </div>
    );

    function handleDayClick(day) {
        const newSelectedDays = new Map(selectedDays);

        const yearSelectedDays = new Map(newSelectedDays.get(year));
        newSelectedDays.set(year, yearSelectedDays);

        const monthSelectedDays = new Set(yearSelectedDays.get(month));
        yearSelectedDays.set(month, monthSelectedDays);

        if (monthSelectedDays.has(day)) {
            monthSelectedDays.delete(day);
        } else {
            monthSelectedDays.add(day);
        }

        setSelectedDays(newSelectedDays);
    }

    function handlePrevMonth() {
        if (month === 0) {
            setYear(year - 1);
            setMonth(11);
        } else {
            setMonth(month - 1);
        }
    }

    function handleNextMonth() {
        if (month === 11) {
            setYear(year + 1);
            setMonth(0);
        } else {
            setMonth(month + 1);
        }
    }
}

function daysInYear(year) {
    return ((year % 4 === 0 && year % 100 > 0) || year %400 === 0) ? 366 : 365;
}
// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Calendar />);
