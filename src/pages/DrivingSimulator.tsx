import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { 
  ArrowLeft, 
  Trophy,
  Zap,
  Target,
  Clock,
  Star,
  Play,
  Pause,
  RotateCcw,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Car,
  Fuel,
  Gauge
} from "lucide-react";
import { Link } from "react-router-dom";

type GameMode = 'menu' | 'highway' | 'parking' | 'traffic' | 'results';
type Direction = 'left' | 'right' | 'up' | 'down' | null;

interface GameStats {
  score: number;
  distance: number;
  coinsCollected: number;
  obstaclesHit: number;
  timeElapsed: number;
  accuracy: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'car' | 'cone' | 'barrier' | 'coin' | 'fuel';
  lane: number;
}

const DrivingSimulator = () => {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game state
  const [carPosition, setCarPosition] = useState({ x: 150, y: 500, lane: 1 });
  const [speed, setSpeed] = useState(5);
  const [fuel, setFuel] = useState(100);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [direction, setDirection] = useState<Direction>(null);
  
  // Game stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coinsCollected: 0,
    obstaclesHit: 0,
    timeElapsed: 0,
    accuracy: 100
  });
  
  const [highScores, setHighScores] = useState({
    highway: 0,
    parking: 0,
    traffic: 0
  });

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const CAR_WIDTH = 50;
  const CAR_HEIGHT = 80;
  const LANES = [75, 175, 275]; // 3 lanes

  // Load high scores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('drivingSimHighScores');
    if (saved) {
      setHighScores(JSON.parse(saved));
    }
  }, []);

  // Save high scores
  const saveHighScore = (mode: string, score: number) => {
    const newScores = { ...highScores, [mode]: Math.max(highScores[mode as keyof typeof highScores], score) };
    setHighScores(newScores);
    localStorage.setItem('drivingSimHighScores', JSON.stringify(newScores));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;
      
      switch(e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setDirection('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setDirection('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          setSpeed(prev => Math.min(prev + 1, 10));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setSpeed(prev => Math.max(prev - 1, 2));
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    const handleKeyUp = () => {
      setDirection(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isPaused]);

  // Touch controls for mobile
  const handleLaneChange = (targetLane: number) => {
    if (!isPlaying || isPaused) return;
    setCarPosition(prev => ({
      ...prev,
      lane: targetLane,
      x: LANES[targetLane]
    }));
  };

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = Date.now();
    let obstacleSpawnTimer = 0;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // Update car position based on direction
      if (direction === 'left' && carPosition.lane > 0) {
        setCarPosition(prev => ({
          ...prev,
          lane: prev.lane - 1,
          x: LANES[prev.lane - 1]
        }));
        setDirection(null);
      } else if (direction === 'right' && carPosition.lane < 2) {
        setCarPosition(prev => ({
          ...prev,
          lane: prev.lane + 1,
          x: LANES[prev.lane + 1]
        }));
        setDirection(null);
      }

      // Spawn obstacles
      obstacleSpawnTimer += deltaTime;
      if (obstacleSpawnTimer > 1.5 / speed) {
        const lane = Math.floor(Math.random() * 3);
        const type = Math.random() > 0.7 ? 'coin' : Math.random() > 0.8 ? 'fuel' : Math.random() > 0.5 ? 'car' : 'cone';
        
        setObstacles(prev => [...prev, {
          id: Date.now(),
          x: LANES[lane],
          y: -50,
          type,
          lane
        }]);
        obstacleSpawnTimer = 0;
      }

      // Update obstacles
      setObstacles(prev => {
        const updated = prev.map(obs => ({
          ...obs,
          y: obs.y + speed * 60 * deltaTime
        })).filter(obs => obs.y < CANVAS_HEIGHT + 100);

        // Collision detection
        updated.forEach(obs => {
          if (
            Math.abs(obs.x - carPosition.x) < 40 &&
            Math.abs(obs.y - carPosition.y) < 60
          ) {
            if (obs.type === 'coin') {
              setStats(s => ({ ...s, score: s.score + 10, coinsCollected: s.coinsCollected + 1 }));
              obs.y = CANVAS_HEIGHT + 200; // Remove coin
            } else if (obs.type === 'fuel') {
              setFuel(f => Math.min(f + 20, 100));
              obs.y = CANVAS_HEIGHT + 200; // Remove fuel
            } else {
              setStats(s => ({ 
                ...s, 
                score: Math.max(0, s.score - 20),
                obstaclesHit: s.obstaclesHit + 1,
                accuracy: Math.max(0, s.accuracy - 5)
              }));
              obs.y = CANVAS_HEIGHT + 200; // Remove obstacle
            }
          }
        });

        return updated;
      });

      // Update stats
      setStats(prev => ({
        ...prev,
        distance: prev.distance + speed * deltaTime,
        timeElapsed: prev.timeElapsed + deltaTime,
        score: prev.score + Math.floor(speed * deltaTime)
      }));

      // Decrease fuel
      setFuel(prev => {
        const newFuel = prev - speed * deltaTime * 0.1;
        if (newFuel <= 0) {
          endGame();
          return 0;
        }
        return newFuel;
      });

      // Draw game
      drawGame(ctx);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPaused, carPosition, obstacles, speed, direction, fuel]);

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw lane lines
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(LANES[i] - 25, 0);
      ctx.lineTo(LANES[i] - 25, CANVAS_HEIGHT);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw obstacles
    obstacles.forEach(obs => {
      if (obs.type === 'car') {
        // Draw other car (red)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(obs.x - 20, obs.y - 30, 40, 60);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(obs.x - 15, obs.y - 20, 30, 20);
        // Windows
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(obs.x - 12, obs.y - 15, 24, 12);
      } else if (obs.type === 'cone') {
        // Draw traffic cone (orange)
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y - 20);
        ctx.lineTo(obs.x - 10, obs.y + 10);
        ctx.lineTo(obs.x + 10, obs.y + 10);
        ctx.closePath();
        ctx.fill();
        // White stripe
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x - 8, obs.y - 5, 16, 3);
      } else if (obs.type === 'coin') {
        // Draw coin (gold)
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'fuel') {
        // Draw fuel can (green)
        ctx.fillStyle = '#10b981';
        ctx.fillRect(obs.x - 12, obs.y - 15, 24, 30);
        ctx.fillStyle = '#059669';
        ctx.fillRect(obs.x - 8, obs.y - 20, 16, 8);
      }
    });

    // Draw player car (blue)
    const carX = carPosition.x;
    const carY = carPosition.y;
    
    // Car body
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(carX - 25, carY - 40, 50, 80);
    
    // Car top
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(carX - 20, carY - 30, 40, 30);
    
    // Windows
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(carX - 15, carY - 25, 30, 20);
    
    // Wheels
    ctx.fillStyle = '#000000';
    ctx.fillRect(carX - 28, carY - 35, 8, 15);
    ctx.fillRect(carX + 20, carY - 35, 8, 15);
    ctx.fillRect(carX - 28, carY + 20, 8, 15);
    ctx.fillRect(carX + 20, carY + 20, 8, 15);
  };

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setIsPlaying(true);
    setIsPaused(false);
    setCarPosition({ x: LANES[1], y: 500, lane: 1 });
    setSpeed(5);
    setFuel(100);
    setObstacles([]);
    setStats({
      score: 0,
      distance: 0,
      coinsCollected: 0,
      obstaclesHit: 0,
      timeElapsed: 0,
      accuracy: 100
    });
  };

  const endGame = () => {
    setIsPlaying(false);
    setGameMode('results');
    if (gameMode === 'highway') {
      saveHighScore('highway', stats.score);
    }
  };

  const resetGame = () => {
    setGameMode('menu');
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/services/driving-license">
          <Button variant="ghost" className="mb-6 text-white hover:bg-white/10">
            <ArrowLeft className="mr-2" size={20} />
            {language === 'en' ? 'Back to Driving License' : 'ಚಾಲನಾ ಪರವಾನಗಿಗೆ ಹಿಂತಿರುಗಿ'}
          </Button>
        </Link>

        {/* Menu Screen */}
        {gameMode === 'menu' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
                <Car className="text-white" size={64} />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                🎮 {language === 'en' ? 'Virtual Driving Simulator' : 'ವರ್ಚುವಲ್ ಡ್ರೈವಿಂಗ್ ಸಿಮ್ಯುಲೇಟರ್'}
              </h1>
              <p className="text-xl text-gray-300">
                {language === 'en' 
                  ? 'Master driving skills with interactive challenges!'
                  : 'ಸಂವಾದಾತ್ಮಕ ಸವಾಲುಗಳೊಂದಿಗೆ ಚಾಲನಾ ಕೌಶಲ್ಯಗಳನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ!'
                }
              </p>
            </div>

            {/* High Scores */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50">
                <CardContent className="p-6 text-center">
                  <Trophy className="text-yellow-400 mx-auto mb-2" size={32} />
                  <p className="text-white/70 text-sm">Highway High Score</p>
                  <p className="text-3xl font-bold text-yellow-400">{highScores.highway}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50">
                <CardContent className="p-6 text-center">
                  <Target className="text-blue-400 mx-auto mb-2" size={32} />
                  <p className="text-white/70 text-sm">Parking Best Time</p>
                  <p className="text-3xl font-bold text-blue-400">{highScores.parking}s</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50">
                <CardContent className="p-6 text-center">
                  <Zap className="text-green-400 mx-auto mb-2" size={32} />
                  <p className="text-white/70 text-sm">Traffic Best Score</p>
                  <p className="text-3xl font-bold text-green-400">{highScores.traffic}</p>
                </CardContent>
              </Card>
            </div>

            {/* Game Modes */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-blue-500/50 hover:scale-105 transition-transform cursor-pointer">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-white text-center text-2xl">
                    🛣️ Highway Drive
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    {language === 'en' 
                      ? 'Dodge traffic and collect coins on the highway'
                      : 'ಹೆದ್ದಾರಿಯಲ್ಲಿ ಟ್ರಾಫಿಕ್ ತಪ್ಪಿಸಿ ಮತ್ತು ನಾಣ್ಯಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => startGame('highway')}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Play className="mr-2" size={20} />
                    Play Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600/30 to-red-600/30 border-orange-500/50 hover:scale-105 transition-transform">
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <Target size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-white text-center text-2xl">
                    🅿️ Parking Challenge
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    {language === 'en' 
                      ? 'Master parallel and perpendicular parking'
                      : 'ಸಮಾನಾಂತರ ಮತ್ತು ಲಂಬ ಪಾರ್ಕಿಂಗ್ ಕರಗತ ಮಾಡಿಕೊಳ್ಳಿ'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    disabled
                    className="w-full bg-orange-600/50"
                    size="lg"
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50 hover:scale-105 transition-transform">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                    <AlertTriangle size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-white text-center text-2xl">
                    🚦 Traffic Scenarios
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-center">
                    {language === 'en' 
                      ? 'Navigate signals, turns, and intersections'
                      : 'ಸಿಗ್ನಲ್ಗಳು, ತಿರುವುಗಳು ಮತ್ತು ಛೇದಿಸುವಿಕೆಗಳನ್ನು ನ್ಯಾವಿಗೇಟ್ ಮಾಡಿ'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    disabled
                    className="w-full bg-green-600/50"
                    size="lg"
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card className="mt-8 bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-center">
                  🎮 {language === 'en' ? 'How to Play' : 'ಹೇಗೆ ಆಡುವುದು'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 text-white">
                  <div>
                    <h4 className="font-bold mb-2 text-blue-400">💻 Desktop Controls:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>⬅️ <kbd className="px-2 py-1 bg-white/10 rounded">←</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">A</kbd> - Move Left</li>
                      <li>➡️ <kbd className="px-2 py-1 bg-white/10 rounded">→</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">D</kbd> - Move Right</li>
                      <li>⬆️ <kbd className="px-2 py-1 bg-white/10 rounded">↑</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">W</kbd> - Speed Up</li>
                      <li>⬇️ <kbd className="px-2 py-1 bg-white/10 rounded">↓</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">S</kbd> - Slow Down</li>
                      <li>⏸️ <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> - Pause</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-green-400">📱 Mobile Controls:</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>👆 Tap lane buttons to change lanes</li>
                      <li>🎯 Collect gold coins (+10 points)</li>
                      <li>⛽ Grab fuel cans to refill</li>
                      <li>🚗 Avoid red cars (-20 points)</li>
                      <li>🚧 Dodge traffic cones</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Screen */}
        {gameMode === 'highway' && isPlaying && (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Stats Panel */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-500/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy size={24} className="text-yellow-400" />
                      Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-5xl font-bold text-yellow-400">{Math.floor(stats.score)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-blue-500/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Fuel size={24} className="text-red-400" />
                      Fuel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={fuel} className="h-6 mb-2" />
                    <p className="text-white text-center font-bold">{Math.floor(fuel)}%</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-green-500/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Gauge size={24} className="text-green-400" />
                      Speed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-400">{speed} mph</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-white text-sm">
                      <div>
                        <p className="text-gray-400">Distance</p>
                        <p className="font-bold">{Math.floor(stats.distance)} m</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Time</p>
                        <p className="font-bold">{Math.floor(stats.timeElapsed)}s</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Coins</p>
                        <p className="font-bold text-yellow-400">{stats.coinsCollected}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Hits</p>
                        <p className="font-bold text-red-400">{stats.obstaclesHit}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                  </Button>
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    <RotateCcw size={20} />
                  </Button>
                </div>
              </div>

              {/* Game Canvas */}
              <div className="lg:col-span-2">
                <Card className="bg-black/50 border-purple-500/50 overflow-hidden">
                  <CardContent className="p-0 relative">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_WIDTH}
                      height={CANVAS_HEIGHT}
                      className="w-full max-w-md mx-auto block"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    
                    {isPaused && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-4xl font-bold text-white mb-4">⏸️ PAUSED</h2>
                          <Button 
                            onClick={() => setIsPaused(false)}
                            className="bg-green-600 hover:bg-green-700"
                            size="lg"
                          >
                            <Play className="mr-2" size={20} />
                            Resume
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Mobile Lane Controls */}
                    <div className="mt-4 grid grid-cols-3 gap-2 p-4 lg:hidden">
                      <Button
                        onClick={() => handleLaneChange(0)}
                        className={`${carPosition.lane === 0 ? 'bg-blue-600' : 'bg-gray-600'}`}
                      >
                        ⬅️ Left
                      </Button>
                      <Button
                        onClick={() => handleLaneChange(1)}
                        className={`${carPosition.lane === 1 ? 'bg-blue-600' : 'bg-gray-600'}`}
                      >
                        ⬆️ Center
                      </Button>
                      <Button
                        onClick={() => handleLaneChange(2)}
                        className={`${carPosition.lane === 2 ? 'bg-blue-600' : 'bg-gray-600'}`}
                      >
                        ➡️ Right
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {gameMode === 'results' && (
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border-purple-500/50">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy size={48} className="text-white" />
                </div>
                <CardTitle className="text-white text-4xl mb-2">
                  🎉 {language === 'en' ? 'Game Over!' : 'ಆಟ ಮುಗಿಯಿತು!'}
                </CardTitle>
                <CardDescription className="text-gray-300 text-xl">
                  {stats.score > highScores.highway 
                    ? '🏆 New High Score!' 
                    : 'Great driving!'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Final Score</p>
                    <p className="text-4xl font-bold text-yellow-400">{Math.floor(stats.score)}</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Distance</p>
                    <p className="text-4xl font-bold text-blue-400">{Math.floor(stats.distance)}m</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">Time</p>
                    <p className="text-4xl font-bold text-green-400">{Math.floor(stats.timeElapsed)}s</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white flex items-center gap-2">
                      <Star className="text-yellow-400" size={20} />
                      Coins Collected
                    </span>
                    <Badge className="bg-yellow-500 text-white">{stats.coinsCollected}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white flex items-center gap-2">
                      <CheckCircle2 className="text-green-400" size={20} />
                      Accuracy
                    </span>
                    <Badge className="bg-green-500 text-white">{Math.floor(stats.accuracy)}%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white flex items-center gap-2">
                      <XCircle className="text-red-400" size={20} />
                      Obstacles Hit
                    </span>
                    <Badge className="bg-red-500 text-white">{stats.obstaclesHit}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-white flex items-center gap-2">
                      <Award className="text-purple-400" size={20} />
                      High Score
                    </span>
                    <Badge className="bg-purple-500 text-white">{highScores.highway}</Badge>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => startGame('highway')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Play className="mr-2" size={20} />
                    {language === 'en' ? 'Play Again' : 'ಮತ್ತೆ ಆಡಿ'}
                  </Button>
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    size="lg"
                  >
                    {language === 'en' ? 'Main Menu' : 'ಮುಖ್ಯ ಮೆನು'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrivingSimulator;
