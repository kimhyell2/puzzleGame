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

    // 불가능한 셀 확인인
    const [impossible, setImpossible] = useState<number[]>([]);

    //선택한 셀의 색상 변경 
    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, gridSize * cellsize, gridSize * cellsize);

        for (let i = 0; i < cells.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = col * cellsize;
            const y = row * cellsize;

            const value = cells[i];

            // 🎯 셀의 상태에 따라 색상 변경
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 그리드 그리기
        drawGrid(ctx);
    }, [cells, selectcells, impossible]);  // selectcells와 impossible도 의존성에 추가




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

    const handleClick = (index: number) => {
        if (selectcells.includes(index)) return;

        const newSelectCells = [...selectcells, index];

        // 선택한 두개의 셀의 인접성 확인 후 결과 값 콘솔에 출력 
        if (newSelectCells.length === 2) {
            const [first, second] = newSelectCells;
            const v1 = cells[first];
            const v2 = cells[second];

            // 선택한 셀 업데이트
            setSelectCells(newSelectCells);

            // 선택한 두 셀의 인접성 및 값 비교
            setTimeout(() => {
                if (location(first, second) && v1 === v2) {
                    // cells 배열을 복사해서 newCells 생성(객체를 직접 수정할 수 없으므로 복사 후 수정)
                    const newCells = [...cells];
                    const newValues = v1 + v2;
                    // 첫 번째 셀에 합산된 값 저장
                    newCells[first] = newValues;

                    // 1024가 되면 랜덤으로 숫자 생성 및 추가 점수
                    if (newValues === 1024) {
                        newCells[first] = getRandomNumber();
                        const newScore = score + 100;
                        setScore(newScore);
                        console.log('100점이 추가 되었습니다');
                        alert('1024가 되었습니다! 100점이 추가 되었습니다!');
                    }

                    // 두 번째 셀 초기화(랜덤 설정정)
                    newCells[second] = getRandomNumber()
                    // 상태 업데이트
                    setCells(newCells);
                    // 점수 업데이트
                    setScore(prev => prev + newValues);
                    console.log('가능');
                    console.log('점수 : ', score + newValues);
                } else {
                    // 불가능한 셀 확인
                    setImpossible(newSelectCells);
                    console.log('불가능');

                    // 불가능한 셀 색상 변경
                    setTimeout(() => {
                        setImpossible([]);
                        setSelectCells([]);
                    }, 200)
                }
                setSelectCells([]);
            }, 300);

        } else {
            // 선택한 셀의 색상 변경
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < cells.length; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            const x = col * cellsize;
            const y = row * cellsize;
            const value = cells[i];

            // 🎨 셀 배경색을 CSS 변수에서 가져오기
            const cssColor = getComputedStyle(document.documentElement)
                .getPropertyValue(`--color-${value}`)
                .trim() || 'white';

            ctx.fillStyle = cssColor;
            ctx.fillRect(x, y, cellsize, cellsize);

            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, cellsize, cellsize);

            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value.toString(), x + cellsize / 2, y + cellsize / 2);
        }
    }, [cells]);


    // 마우스 이벤트 핸들러
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const index = getCellIndexFromMouse(x, y);
        if (index !== null) {
            setSelectCells([index]);
            setIsDragging(true);
        }
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const index = getCellIndexFromMouse(x, y);
        if (index !== null && !selectcells.includes(index)) {
            setSelectCells((prev) => [...prev, index]);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);

        if (selectcells.length === 2) {
            const [first, second] = selectcells;
            const v1 = cells[first];
            const v2 = cells[second];

            if (location(first, second) && v1 === v2) {
                const newCells = [...cells];
                const newValues = v1 + v2;
                newCells[first] = newValues;

                if (newValues === 1024) {
                    newCells[first] = getRandomNumber();
                    const newScore = score + 100;
                    setScore(newScore);
                    alert('1024가 되었습니다! 100점이 추가 되었습니다!');
                }

                newCells[second] = getRandomNumber();
                setCells(newCells);
                setScore((prev) => prev + newValues);
            } else {
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
