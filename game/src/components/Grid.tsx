import { get } from 'http';
import './Grid.css';
import React, { useState, useEffect } from 'react';

const Grid: React.FC = () => { // 그리드 함수 형성성
    const gridSize = 5; // 그리드 크기
    const number = [2, 4, 8, 16, 32]; // 랜덤으로 생성할 숫자들

    const [cells, setCells] = useState<number[]>(() => { // 초기값 설정
        // 초기 랜덤으로 숫자 생성
        return Array.from({ length: gridSize * gridSize }, () => {
            return number[Math.floor(Math.random() * number.length)];
        });
    });

    // 랜덤으로 숫자 생성
    const getRandomNumber = () => {
        return number[Math.floor(Math.random() * number.length)];
    }

    // 선택한 셀의 값 가져오기기
    const [selectcells, setSelectCells] = useState<number[]>([]);

    // score 값 설정하기
    const [score, setScore] = useState<number>(0);

    const handleClick = (index: number) => {
        if (selectcells.includes(index)) return;

        const newSelectCells = [...selectcells, index];

        // 선택한 두개의 셀의 인접성 확인 후 결과 값 콘솔에 출력 
        if (newSelectCells.length === 2) {
            const [first, second] = newSelectCells;
            const v1 = cells[first];
            const v2 = cells[second];

            setSelectCells(newSelectCells); // 선택한 셀 업데이트

            setTimeout(() => { // 0.5초 대기 후 실행 바로 실행시 두번째 셀이 선택된게 확인이 안됨됨
                if (location(first, second) && v1 === v2) {
                    const newCells = [...cells]; // cells 배열을 복사해서 newCells 생성(객체를 직접 수정할 수 없으므로 복사 후 수정)
                    const newValues = v1 + v2; // 두 셀의 값 더하기
                    newCells[first] = newValues; // 첫 번째 셀에 새로운 값 저장
                    if (newValues === 1024) {
                        newCells[first] = getRandomNumber(); // 1024가 되면 랜덤으로 숫자 생성
                    }
                    newCells[second] = getRandomNumber() // 두 번째 셀 초기화
                    setCells(newCells); // 상태 업데이트
                    setScore(prev => prev + newValues); // 점수 업데이트
                    console.log('가능');
                    console.log('점수 : ', score + newValues);
                } else {
                    console.log('불가능');
                }
                setSelectCells([]);
            }, 500); // 0.5초 대기 후 실행


        } else {
            setSelectCells(newSelectCells);
        }
    }
    //선택한 2개의 셀의 인접성 확인 *자 모양
    const location = (i1: number, i2: number): boolean => {
        console.log('i1 : ', i1, 'i2 : ', i2);

        const row1 = Math.floor(i1 / gridSize);
        const col1 = i1 % gridSize;
        const row2 = Math.floor(i2 / gridSize);
        const col2 = i2 % gridSize;

        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);

        return (
            (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0)
        );
    };

    // 그리드 출력
    return (
        <div> {/* 하나의 부모밖에 존재할 수 없으므로 전체를 하나의 div 태그로 감싸고 안에 요소를 넣어줘야한다. */}
            <div className="grid">
                {cells.map((value, index) => (
                    <div key={index} className={`cell ${selectcells.includes(index) ? 'selected' : ''}`}
                        onClick={() => {
                            console.log(index);
                            handleClick(index);
                        }} >
                        {value}
                    </div>
                ))}
            </div>

            <div className="score">
                <h2>점수 : {score}</h2>
            </div>
        </div>
    );
};


export default Grid;
