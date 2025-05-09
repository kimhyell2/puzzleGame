import './Grid.css';
import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField } from '@mui/material';

// 그리드 함수 형성
const Grid: React.FC = () => {
    const gridSize = 5;
    const number = [2, 4, 8, 16, 32, 64, 128];
    const cellsize = 110;

    // 랜덤 숫자 하나 생성 함수
    const getRandomNumber = () => {
        return number[Math.floor(Math.random() * number.length)];
    };

    // 그리드 전체 랜덤 숫자 배열 생성
    const generateRandomCells = () => {
        return Array.from({ length: gridSize * gridSize }, () => getRandomNumber());
    };

    // 초기 셀 상태
    const [cells, setCells] = useState<number[]>(() => generateRandomCells());
    const [score, setScore] = useState<number>(0);
    const [rank, setRank] = useState<number[]>([]);
    const [selectcells, setSelectCells] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [impossible, setImpossible] = useState<number[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // 리셋 버튼 클릭시 그리드 초기화 및 점수 저장
    const resetGame = () => {
        if (score > 0) {
            setRank(prev => [...prev, score]);
        }
        setCells(generateRandomCells());
        setSelectCells([]);
        setImpossible([]);
        setScore(0);
    };

    // 마우스 클릭시 셀 인덱스 계산
    const getCellIndexFromMouse = (x: number, y: number) => {
        const col = Math.floor(x / cellsize);
        const row = Math.floor(y / cellsize);
        if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
            return row * gridSize + col;
        }
        return null;
    };

    // 그리드 그리기
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        // ctx. canvas 그리기 문맥
        ctx.clearRect(0, 0, gridSize * cellsize, gridSize * cellsize);
        for (let i = 0; i < cells.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = col * cellsize;
            const y = row * cellsize;
            const value = cells[i];

            // 가능 및 불가능 셀 색상 설정
            if (impossible.includes(i)) {
                ctx.fillStyle = 'red';
            } else if (selectcells.includes(i)) {
                ctx.fillStyle = 'lightblue';
            } else {
                const cssColor = getComputedStyle(document.documentElement)
                    .getPropertyValue(`--color-${value}`)
                    .trim();
                ctx.fillStyle = cssColor || 'white';
            }

            // 셀 그리기
            ctx.fillRect(x, y, cellsize, cellsize);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, cellsize, cellsize);
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value.toString(), x + cellsize / 2, y + cellsize / 2);
        }
    };

    // 의존성 배열이 변경될 때마다 그리드 다시 그리기
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // 선, 사각형, 이미지, 텍스트 등 그릴 수 있는 메소드를 제공하는 2D 컨텍스트를 가져옴
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        drawGrid(ctx);
    }, [cells, selectcells, impossible]);

    // 셀 위치를 확인하는 함수
    const location = (i1: number, i2: number): boolean => {
        const row1 = Math.floor(i1 / gridSize);
        const col1 = i1 % gridSize;
        const row2 = Math.floor(i2 / gridSize);
        const col2 = i2 % gridSize;
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff <= 1 && colDiff <= 1) && !(rowDiff === 0 && colDiff === 0);
    };

    // 셀을 클릭했을때 셀의 인덱스를 확인
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // 요소의 위치, 크기 정보를 가져옴
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 위에서 구한 좌표로 셀의 인덱스를 확인
        const index = getCellIndexFromMouse(x, y);
        if (index !== null) {
            setSelectCells([index]);
            setIsDragging(true);
        }
    };

    // 셀 드래그시 셀의 인덱스 확인
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        // 요소의 위치, 크기 정보를 가져옴
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 위에서 구한 좌표로 셀의 인덱스를 확인
        const index = getCellIndexFromMouse(x, y);
        if (index !== null && !selectcells.includes(index)) {
            setSelectCells((prev) => [...prev, index]);
        }
    };
    
    // 드래그가 끝났을때 인덱스 확인 후 계산
    const handleMouseUp = () => {
        setIsDragging(false);

        // 셀을 2개 이상 선택시 진행
        if (selectcells.length >= 2) {
            const values = selectcells.map(i => cells[i]);
            const firstValue = values[0];
            const allSame = values.every(v => v === firstValue);

            // 선택된 모든 셀의 값이 같아야 함
            if (allSame) {
                const newCells = [...cells];
                let newValue = firstValue + firstValue;

                for (let i = 2; i < selectcells.length; i++) {
                    newValue *= 2;
                }

                newCells[selectcells[0]] = newValue;

                // 선택된 셀을 제외한 나머지 셀에 랜덤 숫자 생성
                for (let i = 1; i < selectcells.length; i++) {
                    newCells[selectcells[i]] = getRandomNumber();
                }

                let newScore = score + newValue;

                // 1024가 되었을때 추가 점수
                if (newValue === 1024) {
                    newCells[selectcells[0]] = getRandomNumber();
                    newScore += 1000;
                    alert('1024가 되었습니다! 1000점이 추가 되었습니다!');
                }

                setCells(newCells);
                setScore(newScore);
            } else {
                setImpossible(selectcells);
                setTimeout(() => setImpossible([]), 200);
            }
        }

        setSelectCells([]);
    };

    return (
        <div>
            <div className="button-box">
                <h1 className="title">1024 게임</h1>
                <Button variant="contained" className="resetButton" onClick={resetGame}>new Game</Button>
            </div>
            <div className="Box">
                <TextField className="score-box" label="score" variant="outlined" value={score} />
                <TextField className="rank-box" label="rank" variant="outlined"
                    value={rank.length > 0 ? Math.max(...rank) : 0}
                    InputProps={{ readOnly: true }} />
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
