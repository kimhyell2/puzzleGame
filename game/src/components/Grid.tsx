import { get } from 'http';
import './Grid.css';
import React, { useState, useEffect, use } from 'react';
import { TIMEOUT } from 'dns';
import { Button, TextField } from '@mui/material';
import { useRef } from 'react';


// 그리드 함수 형성
const Grid: React.FC = () => {
    // 그리드 크기 설정
    const gridSize = 5;

    // 랜덤으로 생성할 숫자들의 배열
    const number = [2, 4, 8, 16, 32, 64, 128];

    // 초기 랜덤으로 숫자 생성
    const [cells, setCells] = useState<number[]>(() => {
        // 초기값 설정
        return Array.from({ length: gridSize * gridSize }, () => {
            return number[Math.floor(Math.random() * number.length)];
        });
    });

    // 선택한 셀의 값 가져오기기
    const [selectcells, setSelectCells] = useState<number[]>([]);

    // 드래깅 기능
    const [isDragging, setIsDragging] = useState(false);

    // 캔버스 참조 생성
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const cellsize = 110;

    // 셀 좌표 계산 함수
    const getCellIndexFromMouse = (x: number, y: number) => {
        const col = Math.floor(x / cellsize);
        const row = Math.floor(y / cellsize);
        if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
            return row * gridSize + col;
        }
        return null;
    }

    // 불가능한 셀 확인
    const [impossible, setImpossible] = useState<number[]>([]);

    //실제 그리드를 그리는 함수 
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        // 캔버스를 전부 지우는 코드
        ctx.clearRect(0, 0, gridSize * cellsize, gridSize * cellsize);

        // 그리드 그리기 시작
        for (let i = 0; i < cells.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = col * cellsize;
            const y = row * cellsize;

            // 셀에 값 대입하기
            const value = cells[i];

            //  셀의 상태에 따라 색상 변경
            if (impossible.includes(i)) {
                ctx.fillStyle = 'red';
            } else if (selectcells.includes(i)) {
                // 선택된 셀은 'lightblue'로 색상 변경
                ctx.fillStyle = 'lightblue';
            } else {
                // 기본 색상 (CSS 변수 적용 가능)
                const cssColor = getComputedStyle(document.documentElement)
                    .getPropertyValue(`--color-${value}`)
                    .trim();
                // fallback 색상 처리
                ctx.fillStyle = cssColor ? cssColor : 'white';
            }
            // 셀 배경색 
            ctx.fillRect(x, y, cellsize, cellsize);

            // 셀 테두리
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, cellsize, cellsize);

            // 셀 안의 값
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value.toString(), x + cellsize / 2, y + cellsize / 2);
        }
    };

    // 그리드가 처음 랜더링될때 그리드 그리기
    useEffect(() => {
        // canvasRef에서 실제 canvas DOM 요소를 가져옴
        const canvas = canvasRef.current;
        if (!canvas) return;
        // canvas의 2D 컨텍스트를 가져옴(이를 통해 그리기 작업을 수행)
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // 셀 상태에 따라 전체 다시 그림
        drawGrid(ctx);
        // 이 세 가지 상태가 바뀔 때마다 다시 그림
    }, [cells, selectcells, impossible]);


    // 랜덤으로 숫자 생성
    const getRandomNumber = () => {
        return number[Math.floor(Math.random() * number.length)];
    }

    // score 값 설정하기
    const [score, setScore] = useState<number>(0);

    // 리셋 버튼시 초기화
    const resetNumber = () => {
        return Array.from({ length: gridSize * gridSize }, () => {
            return number[Math.floor(Math.random() * number.length)];
        });
    }

    //리셋 기능 구현
    const resetGame = () => {

        // 이전 점수가 존재하면 저장하기
        if (score > 0) {
            setRank(prev => [...prev, score]);
        }

        // 스코어 및 그리드 초기화
        setCells(resetNumber());
        setSelectCells([]);
        setImpossible([]);
        setScore(0);
    }

    // 랭크 점수 저장하기
    const [rank, setRank] = useState<number[]>([]);

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

    // 마우스가 캔버스를 누를 때 실행
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // 캔버스 위치를 기준으로 마우스 좌표 계산
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 마우스 좌표를 셀 인덱스로 변환
        const index = getCellIndexFromMouse(x, y);
        // 해당하는 셀 인덱스가 있으면 선택
        if (index !== null) {
            setSelectCells([index]);
            setIsDragging(true);
        }
    };

    // 마우스가 캔버스 위에서 움직일때 실행
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // 현재 마우스 위치에 따라 셀 인덱스 계산
        if (!isDragging) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const index = getCellIndexFromMouse(x, y);

        // 아직 선택되지 않은 셀은 목록에 추가
        if (index !== null && !selectcells.includes(index)) {
            setSelectCells((prev) => [...prev, index]);
        }
    };

    // 마우스에서 버튼을 뗄 때 종료
    const handleMouseUp = () => {
        setIsDragging(false);

        // 선택된 셀의 병합 처리
        if (selectcells.length >= 2) {
            const values = selectcells.map(i => cells[i]);
            const firstValue = values[0];

            // 모든 셀이 같은 값을 가졌는지 확인
            const allSame = values.every(v => v === firstValue);

            if (allSame) {
                const newCells = [...cells];

                // 첫 번째와 두 번째는 더하고, 이후부터는 2씩 곱함
                let newValue = firstValue + firstValue; // 첫 번째와 두 번째는 더함

                for (let i = 2; i < selectcells.length; i++) {
                    newValue *= 2; // 나머지는 2씩 곱함
                }

                // 첫 번째 셀에 병합된 값을 넣고
                newCells[selectcells[0]] = newValue;

                // 나머지 셀은 랜덤 숫자로 변경
                for (let i = 1; i < selectcells.length; i++) {
                    newCells[selectcells[i]] = getRandomNumber();
                }

                // 점수 계산
                let newScore = score + newValue;

                // 1024 도달 시 보너스 추가
                if (newValue === 1024) {
                    newCells[selectcells[0]] = getRandomNumber(); // 1024 셀도 리셋
                    newScore += 100;
                    alert('1024가 되었습니다! 100점이 추가 되었습니다!');
                }

                // 상태 업데이트
                setCells(newCells);
                setScore(newScore);
            } else {
                // 병합 실패: 빨간색으로 셀 표시
                setImpossible(selectcells);
                setTimeout(() => {
                    setImpossible([]);
                }, 200);
            }
        }

        setSelectCells([]);
    };

    // 그리드 출력
    return (
        // 하나의 부모밖에 존재할 수 없으므로 전체를 하나의 div 태그로 감싸고 안에 요소를 넣어줘야한다.
        <div>
            <div className="button-box">
                <h1 className="title">1024 게임</h1>
                <Button variant="contained" className="resetButton" onClick={resetGame} >new Game</Button>
            </div>
            <div className="Box">
                <TextField className="score-box" label="score" variant="outlined" value={score}></TextField>
                <TextField className="rank-box" label="rank" variant="outlined"
                    value={rank.length > 0 ? Math.max(...rank) : 0} InputProps={{ readOnly: true }}></TextField>
            </div>
            <canvas
                ref={canvasRef}
                width={gridSize * cellsize}
                height={gridSize * cellsize}
                style={{ border: '1px solid black' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            />
        </div>
    );
};


export default Grid;
