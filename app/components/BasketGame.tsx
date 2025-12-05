"use client";

import { useEffect, useRef, useState } from "react";

type GameState = {
  score: number;
  shotsLeft: number;
};

export function BasketGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    shotsLeft: 10,
  });
  const [isBallLaunched, setIsBallLaunched] = useState(false);
  const gameLoopRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    // Basket
    const basketWidth = 80;
    const basketHeight = 20;
    let basketX = (WIDTH - basketWidth) / 2;
    const basketY = 140;
    let basketSpeed = 2;
    let basketDirection = 1;

    // Ball
    const ballRadius = 14;
    let ballX = WIDTH / 2;
    let ballY = HEIGHT - 60;
    let ballVy = 0;
    let ballLaunched = false;

    let lastTime = performance.now();

    function resetBall() {
      ballX = WIDTH / 2;
      ballY = HEIGHT - 60;
      ballVy = 0;
      ballLaunched = false;
      setIsBallLaunched(false);
    }

    function drawCourt() {
      if (!ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(20, HEIGHT - 40);
      ctx.lineTo(WIDTH - 20, HEIGHT - 40);
      ctx.stroke();

      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, HEIGHT / 2);
      ctx.lineTo(WIDTH - 20, HEIGHT / 2);
      ctx.stroke();
    }

    function drawBasket() {
      if (!ctx) return;
      ctx.fillStyle = "#f97316";
      ctx.fillRect(basketX, basketY, basketWidth, basketHeight);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        basketX + basketWidth / 2,
        basketY + basketHeight,
        basketWidth / 2,
        0,
        Math.PI
      );
      ctx.stroke();
    }

    function drawBall() {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#f97316";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ea580c";
      ctx.stroke();
    }

    function updateBasket(delta: number) {
      basketX += basketSpeed * basketDirection * (delta / 16.67);
      if (basketX <= 20) {
        basketX = 20;
        basketDirection = 1;
      }
      if (basketX + basketWidth >= WIDTH - 20) {
        basketX = WIDTH - 20 - basketWidth;
        basketDirection = -1;
      }
    }

    function updateBall(delta: number) {
      if (!ballLaunched) return;
      const gravity = 0.35;
      ballVy -= gravity * (delta / 16.67);
      ballY += ballVy * (delta / 16.67);

      if (
        ballY - ballRadius <= basketY + basketHeight &&
        ballY - ballRadius >= basketY - 20 &&
        ballX >= basketX &&
        ballX <= basketX + basketWidth
      ) {
        setGameState((prev) => ({
          ...prev,
          score: prev.score + 10,
        }));
        basketSpeed *= 1.07;
        resetBall();
      }

      if (ballY + ballRadius < 0 || ballY - ballRadius > HEIGHT) {
        resetBall();
      }
    }

    function loop(now: number) {
      const delta = now - lastTime;
      lastTime = now;

      drawCourt();
      updateBasket(delta);
      updateBall(delta);
      drawBasket();
      drawBall();

      gameLoopRef.current = requestAnimationFrame(loop);
    }

    const onShoot = () => {
      if (ballLaunched) return;
      ballLaunched = true;
      ballVy = -10;
      setIsBallLaunched(true);
    };

    window.addEventListener("basketparty_shoot", onShoot);
    gameLoopRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("basketparty_shoot", onShoot);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const handleShoot = () => {
    if (isBallLaunched || gameState.shotsLeft <= 0) return;
    setGameState((prev) => ({
      ...prev,
      shotsLeft: prev.shotsLeft - 1,
    }));
    window.dispatchEvent(new CustomEvent("basketparty_shoot"));
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        width={360}
        height={640}
        style={{
          border: "2px solid #38bdf8",
          borderRadius: 16,
          background:
            "radial-gradient(circle at top, #0f172a 0, #020617 60%)",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 360,
          fontSize: 13,
          color: "#e5e7eb",
        }}
      >
        <span>Score: {gameState.score}</span>
        <span>Shots left: {gameState.shotsLeft}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <button
          onClick={handleShoot}
          disabled={isBallLaunched || gameState.shotsLeft <= 0}
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            border: "none",
            background: "#22c55e",
            color: "#020617",
            fontWeight: 600,
            cursor:
              isBallLaunched || gameState.shotsLeft <= 0
                ? "not-allowed"
                : "pointer",
            minWidth: 120,
            opacity:
              isBallLaunched || gameState.shotsLeft <= 0 ? 0.6 : 1,
          }}
        >
          Shoot
        </button>
      </div>
    </div>
  );
}
