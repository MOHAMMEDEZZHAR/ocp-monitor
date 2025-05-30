import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useThresholds } from "@/contexts/ThresholdContext"
import { AlertTriangle, Thermometer, Droplets, Battery, Gauge, Activity, Waves, Fuel, Zap } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useGaugeStyle } from "@/contexts/GaugeStyleContext"
import { ModernGaugeCard } from "./modern-gauge-card"

interface GaugeCardProps {
  value: number
  tag: string
  status: string
  timestamp: string
  label?: string
  unit?: string
  min?: number
  max?: number
  style?: 'classic' | 'modern'
}

function getGaugeType(tag: string, label: string = "", unit: string = ""): "temperature" | "pressure" | "flow" | "voltage" | "current" | "power" | "humidity" | "default" {
  const tagLower = tag.toLowerCase();
  const labelLower = label.toLowerCase();
  
  if (tagLower.includes("temp") || labelLower.includes("temp") || unit === "°C" || unit === "°F") {
    return "temperature";
  } else if (tagLower.includes("press") || labelLower.includes("press") || unit === "bar" || unit === "psi") {
    return "pressure";
  } else if (tagLower.includes("flow") || labelLower.includes("flow") || tagLower.includes("debit") || labelLower.includes("débit") || unit === "m³/h" || unit === "L/min") {
    return "flow";
  } else if (tagLower.includes("volt") || labelLower.includes("volt") || tagLower.includes("tension") || unit === "V") {
    return "voltage";
  } else if (tagLower.includes("current") || tagLower.includes("ampere") || tagLower.includes("amp") || unit === "A" || unit === "mA") {
    return "current";
  } else if (tagLower.includes("power") || labelLower.includes("power") || tagLower.includes("puissance") || unit === "W" || unit === "kW" || unit === "MW") {
    return "power";
  } else if (tagLower.includes("hum") || labelLower.includes("hum") || unit === "%RH") {
    return "humidity";
  } else {
    return "default";
  }
}

function getGaugeColors(gaugeType: string, isInDanger: boolean): { bgColor: string, fgColor: string, textColor: string, accentColor: string } {
  if (isInDanger) {
    return {
      bgColor: '#2A2A2A', // Dark gray
      fgColor: '#FF6B6B', // Coral red (alert)
      textColor: '#FFFFFF',
      accentColor: '#FF6B6B' // Coral red (alert)
    };
  }
  
  switch (gaugeType) {
    case "temperature":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#FF6B6B' // Coral red for temperature
      };
    case "pressure":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for pressure
      };
    case "flow":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for flow
      };
    case "voltage":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for voltage
      };
    case "current":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for current
      };
    case "power":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for power
      };
    case "humidity":
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for humidity
      };
    default:
      return {
        bgColor: '#2A2A2A', // Dark gray
        fgColor: '#4ECDC4', // Soft teal (OK)
        textColor: '#FFFFFF',
        accentColor: '#4ECDC4' // Soft teal for default
      };
  }
}

export function GaugeCard({ 
  value, 
  tag, 
  status, 
  timestamp, 
  label, 
  unit = "°C", 
  min, 
  max,
  style: propStyle 
}: GaugeCardProps) {
  const { gaugeStyle: contextGaugeStyle } = useGaugeStyle()
  const gaugeStyle = propStyle || contextGaugeStyle
  
  if (gaugeStyle === 'modern') {
    return (
      <ModernGaugeCard
        value={value}
        tag={tag}
        status={status}
        timestamp={timestamp}
        label={label}
        unit={unit}
        min={min}
        max={max}
      />
    )
  }
  
  const { thresholds } = useThresholds()
  const tagThreshold = thresholds.find(t => t.tag === tag)
  const minValue = tagThreshold?.min ?? (min ?? 0)
  const maxValue = tagThreshold?.max ?? (max ?? 100)
  const gaugeType = getGaugeType(tag, label || "", unit)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animatedValue, setAnimatedValue] = useState(0)
  
  const isOutOfRange = value < minValue || value > maxValue
  
  const isInDanger = isOutOfRange || status !== "OK"
  
  const gaugeColors = getGaugeColors(gaugeType, isInDanger)
  
  useEffect(() => {
    const duration = 1000; // durée de l'animation en ms
    const startTime = Date.now();
    const startValue = animatedValue;
    const endValue = value;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setAnimatedValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [value]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const normalizedValue = Math.max(0, Math.min(1, (animatedValue - minValue) / (maxValue - minValue)));
    
    switch (gaugeType) {
      case "temperature":
        drawTemperatureGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      case "pressure":
        drawPressureGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      case "flow":
        drawFlowGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      case "voltage":
        drawVoltageGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      case "current":
        drawCurrentGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      case "power":
        drawPowerGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      case "humidity":
        drawHumidityGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
      default:
        drawDefaultGauge(ctx, width, height, normalizedValue, gaugeColors);
        break;
    }
  }, [animatedValue, minValue, maxValue, isInDanger, gaugeType, gaugeColors]);

  function drawTemperatureGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const thermWidth = width * 0.15;
    const thermHeight = height * 0.6;
    const thermX = centerX - thermWidth / 2;
    const thermY = height * 0.2;
    
    ctx.beginPath();
    ctx.roundRect(thermX, thermY, thermWidth, thermHeight, thermWidth / 2);
    ctx.fillStyle = '#1E1E1E'; // Fond sombre
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#546E7A'; // Bordure métallique
    ctx.stroke();
    
    const bulbRadius = thermWidth * 0.8;
    const bulbX = centerX;
    const bulbY = thermY + thermHeight + bulbRadius * 0.2;
    
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, bulbRadius, 0, Math.PI * 2);
    
    const bulbGradient = ctx.createRadialGradient(
      bulbX - bulbRadius/3, bulbY - bulbRadius/3, 0,
      bulbX, bulbY, bulbRadius
    );
    bulbGradient.addColorStop(0, '#FF6B6B'); // Coral red (alert)
    bulbGradient.addColorStop(1, '#FF4949'); // Coral red plus foncé
    
    ctx.fillStyle = bulbGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#546E7A'; // Bordure métallique
    ctx.stroke();
    
    const mercuryWidth = thermWidth * 0.6;
    const mercuryX = thermX + (thermWidth - mercuryWidth) / 2;
    const mercuryMaxHeight = thermHeight * 0.9;
    const mercuryHeight = mercuryMaxHeight * value;
    const mercuryY = thermY + thermHeight - mercuryHeight;
    
    const mercuryGradient = ctx.createLinearGradient(mercuryX, mercuryY, mercuryX + mercuryWidth, mercuryY + mercuryHeight);
    mercuryGradient.addColorStop(0, '#FF6B6B'); // Coral red (alert)
    mercuryGradient.addColorStop(1, '#FF4949'); // Coral red plus foncé
    
    ctx.beginPath();
    ctx.roundRect(mercuryX, mercuryY, mercuryWidth, mercuryHeight, mercuryWidth / 2);
    ctx.fillStyle = mercuryGradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(mercuryX, thermY + thermHeight);
    ctx.lineTo(mercuryX + mercuryWidth, thermY + thermHeight);
    ctx.lineTo(bulbX + bulbRadius * 0.5, bulbY - bulbRadius * 0.5);
    ctx.lineTo(bulbX - bulbRadius * 0.5, bulbY - bulbRadius * 0.5);
    ctx.lineTo(mercuryX, thermY + thermHeight);
    ctx.fillStyle = mercuryGradient;
    ctx.fill();
    
    const numTicks = 5;
    const tickWidth = 5;
    const tickSpacing = thermHeight / numTicks;
    
    for (let i = 0; i <= numTicks; i++) {
      const tickY = thermY + i * tickSpacing;
      
      ctx.beginPath();
      ctx.moveTo(thermX - tickWidth, tickY);
      ctx.lineTo(thermX, tickY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#546E7A'; // Bordure métallique
      ctx.stroke();
      
      const tickValue = maxValue - (i * (maxValue - minValue)) / numTicks;
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${tickValue.toFixed(0)}°C`, thermX - tickWidth - 2, tickY);
    }
    
    const displayValue = (value * (maxValue - minValue) + minValue).toFixed(1);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue}°C`, centerX, thermY + thermHeight + bulbRadius * 2 + 10);
  }

  function drawPressureGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height * 0.6; 
    const radius = Math.min(width, height) * 0.4;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI * 2, false);
    ctx.fillStyle = '#1E1E1E'; // Fond sombre
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#546E7A'; // Bordure métallique
    ctx.stroke();
    
    const startAngle = Math.PI;
    const endAngle = Math.PI * 2;
    const arcLength = endAngle - startAngle;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, startAngle, startAngle + arcLength * 0.7, false);
    ctx.arc(centerX, centerY, radius * 0.7, startAngle + arcLength * 0.7, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#4ECDC4'; // Soft teal (OK)
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, startAngle + arcLength * 0.7, startAngle + arcLength * 0.9, false);
    ctx.arc(centerX, centerY, radius * 0.7, startAngle + arcLength * 0.9, startAngle + arcLength * 0.7, true);
    ctx.closePath();
    ctx.fillStyle = '#FFD166'; // Jaune d'avertissement
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, startAngle + arcLength * 0.9, endAngle, false);
    ctx.arc(centerX, centerY, radius * 0.7, endAngle, startAngle + arcLength * 0.9, true);
    ctx.closePath();
    ctx.fillStyle = '#FF6B6B'; // Coral red (alert)
    ctx.fill();
    
    const numTicks = 5;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= numTicks; i++) {
      const angle = startAngle + (arcLength * i) / numTicks;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + radius * 0.65 * Math.cos(angle),
        centerY + radius * 0.65 * Math.sin(angle)
      );
      ctx.lineTo(
        centerX + radius * 0.85 * Math.cos(angle),
        centerY + radius * 0.85 * Math.sin(angle)
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#546E7A'; // Bordure métallique
      ctx.stroke();
      
      const labelRadius = radius * 0.55;
      const tickValue = (i * (maxValue - minValue)) / numTicks + minValue;
      ctx.fillText(
        `${tickValue.toFixed(0)}`,
        centerX + labelRadius * Math.cos(angle),
        centerY + labelRadius * Math.sin(angle)
      );
    }
    
    const needleAngle = startAngle + arcLength * value;
    const needleLength = radius * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + needleLength * Math.cos(needleAngle),
      centerY + needleLength * Math.sin(needleAngle)
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF'; // Aiguille blanche
    ctx.stroke();
    
    const pivotRadius = radius * 0.1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pivotRadius, 0, Math.PI * 2);
    
    const pivotGradient = ctx.createRadialGradient(
      centerX - pivotRadius/3, centerY - pivotRadius/3, 0,
      centerX, centerY, pivotRadius
    );
    pivotGradient.addColorStop(0, '#1E1E1E'); // Fond sombre
    pivotGradient.addColorStop(1, '#546E7A'); // Bordure métallique
    
    ctx.fillStyle = pivotGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#546E7A'; // Bordure métallique
    ctx.stroke();
    
    const displayValue = (value * (maxValue - minValue) + minValue).toFixed(1);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue} bar`, centerX, centerY - radius * 0.3);
  }

  function drawFlowGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const pipeHeight = height * 0.25;
    const pipeWidth = width * 0.8;
    const pipeY = centerY - pipeHeight / 2;
    const pipeX = (width - pipeWidth) / 2;
    
    const supportHeight = pipeHeight * 1.6;
    const supportWidth = pipeWidth * 1.05;
    const supportX = pipeX - (supportWidth - pipeWidth) / 2;
    const supportY = pipeY - (supportHeight - pipeHeight) / 2;
    
    const metalGradient = ctx.createLinearGradient(supportX, supportY, supportX, supportY + supportHeight);
    metalGradient.addColorStop(0, '#1a1a1a');
    metalGradient.addColorStop(0.5, '#333333');
    metalGradient.addColorStop(1, '#1a1a1a');
    
    ctx.beginPath();
    ctx.roundRect(supportX, supportY, supportWidth, supportHeight, 5);
    ctx.fillStyle = metalGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    
    const screwRadius = pipeHeight * 0.1;
    const screwPositions = [
      { x: supportX + screwRadius * 2, y: supportY + screwRadius * 2 },
      { x: supportX + supportWidth - screwRadius * 2, y: supportY + screwRadius * 2 }
    ];
    
    screwPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, screwRadius, 0, Math.PI * 2);
      const screwGradient = ctx.createRadialGradient(
        pos.x - screwRadius/3, pos.y - screwRadius/3, 0,
        pos.x, pos.y, screwRadius
      );
      screwGradient.addColorStop(0, '#d0e3fa');
      screwGradient.addColorStop(1, '#333333');
      ctx.fillStyle = screwGradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(
        pos.x - Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y - Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineTo(
        pos.x + Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y + Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    });
    
    ctx.beginPath();
    ctx.roundRect(pipeX, pipeY, pipeWidth, pipeHeight, pipeHeight / 2);
    
    const glassGradient = ctx.createLinearGradient(pipeX, pipeY, pipeX, pipeY + pipeHeight);
    glassGradient.addColorStop(0, 'rgba(240, 240, 240, 0.8)');
    glassGradient.addColorStop(0.5, 'rgba(220, 220, 220, 0.6)');
    glassGradient.addColorStop(1, 'rgba(240, 240, 240, 0.8)');
    
    ctx.fillStyle = glassGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.stroke();
    
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pipeX, pipeY, pipeWidth, pipeHeight, pipeHeight / 2);
    ctx.clip();
    
    const liquidGradient = ctx.createLinearGradient(pipeX, pipeY, pipeX, pipeY + pipeHeight);
    liquidGradient.addColorStop(0, 'rgba(0, 200, 83, 0.7)'); // Vert vif plus fort
    liquidGradient.addColorStop(1, 'rgba(0, 180, 75, 0.9)'); // Vert vif plus fort
    
    ctx.fillStyle = liquidGradient;
    ctx.fillRect(pipeX, pipeY, pipeWidth, pipeHeight);
    
    const numArrows = Math.max(1, Math.floor(value * 8));
    const arrowWidth = pipeHeight * 0.7;
    const arrowHeight = pipeHeight * 0.5;
    
    const speed = value * 5;
    const offset = (Date.now() / (1000 / speed)) % (pipeWidth / numArrows);
    
    for (let i = 0; i < numArrows * 2; i++) {
      const arrowX = pipeX + (i * pipeWidth / numArrows) - offset;
      
      if (arrowX > pipeX - arrowWidth && arrowX < pipeX + pipeWidth) {
        const arrowCenterY = pipeY + pipeHeight / 2;
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowCenterY - arrowHeight / 2);
        ctx.lineTo(arrowX + arrowWidth * 0.7, arrowCenterY);
        ctx.lineTo(arrowX, arrowCenterY + arrowHeight / 2);
        ctx.closePath();
        
        const arrowGradient = ctx.createLinearGradient(arrowX, arrowCenterY - arrowHeight / 2, arrowX + arrowWidth * 0.7, arrowCenterY);
        arrowGradient.addColorStop(0, 'rgba(0, 220, 100, 0.9)'); // Vert vif plus fort
        arrowGradient.addColorStop(1, 'rgba(0, 255, 120, 1.0)'); // Vert vif plus fort
        
        ctx.fillStyle = arrowGradient;
        ctx.fill();
      }
    }
    
    ctx.restore();
    
    const scaleY = pipeY + pipeHeight + 10;
    const scaleHeight = 5;
    
    ctx.beginPath();
    ctx.moveTo(pipeX, scaleY);
    ctx.lineTo(pipeX + pipeWidth, scaleY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1a1a1a';
    ctx.stroke();
    
    const numTicks = 5;
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    for (let i = 0; i <= numTicks; i++) {
      const x = pipeX + (pipeWidth * i) / numTicks;
      const tickHeight = scaleHeight * 1.5;
      
      ctx.beginPath();
      ctx.moveTo(x, scaleY);
      ctx.lineTo(x, scaleY + tickHeight);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1a1a1a';
      ctx.stroke();
      
      const tickValue = i * (maxValue - minValue) / numTicks + minValue;
      ctx.fillText(`${tickValue.toFixed(0)}`, x, scaleY + tickHeight + 2);
    }
    
    const displayValue = (value * (maxValue - minValue) + minValue).toFixed(1);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue} L/min`, centerX, pipeY - 15);
  }

  function drawVoltageGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const displayWidth = width * 0.8;
    const displayHeight = height * 0.35;
    const displayX = (width - displayWidth) / 2;
    const displayY = height * 0.2;
    
    const housingWidth = displayWidth * 1.05;
    const housingHeight = height * 0.7;
    const housingX = (width - housingWidth) / 2;
    const housingY = (height - housingHeight) / 2;
    
    const metalGradient = ctx.createLinearGradient(housingX, housingY, housingX + housingWidth, housingY + housingHeight);
    metalGradient.addColorStop(0, '#1a1a1a');
    metalGradient.addColorStop(0.5, '#333333');
    metalGradient.addColorStop(1, '#1a1a1a');
    
    ctx.beginPath();
    ctx.roundRect(housingX, housingY, housingWidth, housingHeight, 5);
    ctx.fillStyle = metalGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    
    const screwRadius = displayHeight * 0.1;
    const screwPositions = [
      { x: housingX + screwRadius * 2, y: housingY + screwRadius * 2 },
      { x: housingX + housingWidth - screwRadius * 2, y: housingY + screwRadius * 2 }
    ];
    
    screwPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, screwRadius, 0, Math.PI * 2);
      const screwGradient = ctx.createRadialGradient(
        pos.x - screwRadius/3, pos.y - screwRadius/3, 0,
        pos.x, pos.y, screwRadius
      );
      screwGradient.addColorStop(0, '#d0e3fa');
      screwGradient.addColorStop(1, '#333333');
      ctx.fillStyle = screwGradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(
        pos.x - Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y - Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineTo(
        pos.x + Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y + Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    });
    
    ctx.beginPath();
    ctx.roundRect(displayX, displayY, displayWidth, displayHeight, 3);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#555555';
    ctx.stroke();
    
    const displayValue = (value * (maxValue - minValue) + minValue).toFixed(1);
    ctx.font = 'bold 24px monospace';
    
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#3b82f6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue}V`, centerX, displayY + displayHeight / 2);
    ctx.shadowBlur = 0;
    
    const barWidth = displayWidth;
    const barHeight = displayHeight * 0.4;
    const barX = displayX;
    const barY = displayY + displayHeight + 10;
    
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth, barHeight, 3);
    ctx.fillStyle = '#222222';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#444444';
    ctx.stroke();
    
    const numSegments = 10;
    const segmentWidth = barWidth / numSegments;
    const segmentPadding = 2;
    const activeSegments = Math.floor(value * numSegments);
    
    for (let i = 0; i < numSegments; i++) {
      const segmentX = barX + i * segmentWidth + segmentPadding / 2;
      const segmentY = barY + segmentPadding / 2;
      const segmentW = segmentWidth - segmentPadding;
      const segmentH = barHeight - segmentPadding;
      
      let segmentColor;
      if (i < numSegments * 0.3) {
        segmentColor = '#3b82f6'; // Bleu (basse tension)
      } else if (i < numSegments * 0.7) {
        segmentColor = '#10b981'; // Vert (tension moyenne)
      } else {
        segmentColor = '#ef4444'; // Rouge (haute tension)
      }
      
      ctx.beginPath();
      ctx.roundRect(segmentX, segmentY, segmentW, segmentH, 2);
      
      if (i < activeSegments) {
        const segmentGradient = ctx.createLinearGradient(segmentX, segmentY, segmentX, segmentY + segmentH);
        segmentGradient.addColorStop(0, segmentColor);
        segmentGradient.addColorStop(0.5, '#ffffff');
        segmentGradient.addColorStop(1, segmentColor);
        
        ctx.fillStyle = segmentGradient;
      } else {
        ctx.fillStyle = '#333333';
      }
      
      ctx.fill();
    }
  }

  function drawCurrentGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const radius = Math.min(width, height) * 0.35;
    
    const outerRadius = radius * 1.1;
    
    const metalGradient = ctx.createRadialGradient(
      centerX, centerY, radius * 0.9,
      centerX, centerY, outerRadius
    );
    metalGradient.addColorStop(0, '#1a1a1a');
    metalGradient.addColorStop(0.7, '#333333');
    metalGradient.addColorStop(1, '#1a1a1a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = metalGradient;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    
    const numScrews = 2;
    const screwRadius = radius * 0.08;
    const screwPositions = [
      { x: centerX - outerRadius * 0.7, y: centerY },
      { x: centerX + outerRadius * 0.7, y: centerY }
    ];
    
    screwPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, screwRadius, 0, Math.PI * 2);
      const screwGradient = ctx.createRadialGradient(
        pos.x - screwRadius/3, pos.y - screwRadius/3, 0,
        pos.x, pos.y, screwRadius
      );
      screwGradient.addColorStop(0, '#d0e3fa');
      screwGradient.addColorStop(1, '#333333');
      ctx.fillStyle = screwGradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(
        pos.x - Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y - Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineTo(
        pos.x + Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y + Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f8ff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1a1a1a';
    ctx.stroke();
    
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const angleRange = endAngle - startAngle;
    const numTicks = 5;
    const majorTickLength = radius * 0.15;
    
    const segmentColors = ['#3b82f6', '#10b981', '#ef4444'];
    const numSegments = segmentColors.length;
    
    for (let i = 0; i < numSegments; i++) {
      const segmentStartAngle = startAngle + (i * angleRange) / numSegments;
      const segmentEndAngle = startAngle + ((i + 1) * angleRange) / numSegments;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.85, segmentStartAngle, segmentEndAngle);
      ctx.arc(centerX, centerY, radius * 0.7, segmentEndAngle, segmentStartAngle, true);
      ctx.closePath();
      
      ctx.fillStyle = segmentColors[i];
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i <= numTicks; i++) {
      const angle = startAngle + (i * angleRange) / numTicks;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + radius * 0.7 * Math.cos(angle),
        centerY + radius * 0.7 * Math.sin(angle)
      );
      ctx.lineTo(
        centerX + (radius * 0.7 + majorTickLength) * Math.cos(angle),
        centerY + (radius * 0.7 + majorTickLength) * Math.sin(angle)
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#1a1a1a';
      ctx.stroke();
      
      const textRadius = radius * 0.55;
      const tickValue = (i / numTicks * (maxValue - minValue) + minValue).toFixed(1);
      ctx.fillText(tickValue, centerX + textRadius * Math.cos(angle), centerY + textRadius * Math.sin(angle));
    }
    
    const needleAngle = startAngle + angleRange * value;
    const needleLength = radius * 0.65;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + needleLength * Math.cos(needleAngle),
      centerY + needleLength * Math.sin(needleAngle)
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#CC0000';
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.06, 0, Math.PI * 2);
    
    const pivotGradient = ctx.createRadialGradient(
      centerX - radius * 0.02, centerY - radius * 0.02, 0,
      centerX, centerY, radius * 0.06
    );
    pivotGradient.addColorStop(0, '#EEEEEE');
    pivotGradient.addColorStop(1, '#999999');
    
    ctx.fillStyle = pivotGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1a1a1a';
    ctx.stroke();
    
    const displayValue = (value * (maxValue - minValue) + minValue).toFixed(1);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue}A`, centerX, centerY + radius * 0.3);
  }

  function drawPowerGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const radius = Math.min(width, height) * 0.35;
    
    const housingRadius = radius * 1.1;
    
    const metalGradient = ctx.createRadialGradient(
      centerX, centerY, radius,
      centerX, centerY, housingRadius
    );
    metalGradient.addColorStop(0, '#1a1a1a');
    metalGradient.addColorStop(0.8, '#333333');
    metalGradient.addColorStop(1, '#1a1a1a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, housingRadius, 0, Math.PI * 2);
    ctx.fillStyle = metalGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    
    const numScrews = 2;
    const screwRadius = radius * 0.08;
    const screwPositions = [
      { x: centerX - housingRadius * 0.7, y: centerY },
      { x: centerX + housingRadius * 0.7, y: centerY }
    ];
    
    screwPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, screwRadius, 0, Math.PI * 2);
      const screwGradient = ctx.createRadialGradient(
        pos.x - screwRadius/3, pos.y - screwRadius/3, 0,
        pos.x, pos.y, screwRadius
      );
      screwGradient.addColorStop(0, '#d0e3fa');
      screwGradient.addColorStop(1, '#333333');
      ctx.fillStyle = screwGradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(
        pos.x - Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y - Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineTo(
        pos.x + Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y + Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f8ff';
    ctx.fill();
    
    const segmentColors = [
      { color: '#3b82f6', label: 'LOW' },
      { color: '#10b981', label: 'MED' },
      { color: '#ef4444', label: 'HIGH' }
    ];
    const numSegments = segmentColors.length;
    const segmentAngle = (Math.PI * 2) / numSegments;
    const segmentRadius = radius * 0.85;
    const innerRadius = radius * 0.4;
    
    const pulseRate = 0.5 + value * 2;
    const pulseAmount = 0.03;
    const pulseOffset = Math.sin(Date.now() / (1000 / pulseRate)) * pulseAmount;
    
    for (let i = 0; i < numSegments; i++) {
      const segmentStartAngle = i * segmentAngle - Math.PI / 2;
      const segmentEndAngle = (i + 1) * segmentAngle - Math.PI / 2;
      
      const segmentPulseRadius = segmentRadius * (1 + (i / numSegments <= value ? pulseOffset : 0));
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, segmentPulseRadius, segmentStartAngle, segmentEndAngle);
      ctx.arc(centerX, centerY, innerRadius, segmentEndAngle, segmentStartAngle, true);
      ctx.closePath();
      
      const isActive = i / numSegments <= value;
      
      ctx.fillStyle = isActive ? segmentColors[i].color : '#CCCCCC';
      ctx.globalAlpha = isActive ? 0.8 : 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      
      if (isActive) {
        const labelRadius = (segmentPulseRadius + innerRadius) / 2;
        const labelAngle = segmentStartAngle + (segmentEndAngle - segmentStartAngle) / 2;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(segmentColors[i].label, labelX, labelY);
      }
    }
    
    const displayValue = (value * (maxValue - minValue) + minValue).toFixed(1);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue}W`, centerX, centerY);
  }

  function drawHumidityGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    const dropWidth = width * 0.5;
    const dropHeight = height * 0.6;
    const dropX = centerX - dropWidth / 2;
    const dropY = height * 0.2;
    
    const housingWidth = dropWidth * 1.1;
    const housingHeight = dropHeight * 1.05;
    const housingX = centerX - housingWidth / 2;
    const housingY = dropY - housingHeight * 0.05;
    
    const metalGradient = ctx.createLinearGradient(housingX, housingY, housingX + housingWidth, housingY + housingHeight);
    metalGradient.addColorStop(0, '#1a1a1a');
    metalGradient.addColorStop(0.5, '#333333');
    metalGradient.addColorStop(1, '#1a1a1a');
    
    ctx.beginPath();
    ctx.roundRect(housingX, housingY, housingWidth, housingHeight, 5);
    ctx.fillStyle = metalGradient;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#333333';
    ctx.stroke();
    
    const screwRadius = dropHeight * 0.03;
    const screwPositions = [
      { x: housingX + screwRadius * 2, y: housingY + screwRadius * 2 },
      { x: housingX + housingWidth - screwRadius * 2, y: housingY + screwRadius * 2 }
    ];
    
    screwPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, screwRadius, 0, Math.PI * 2);
      const screwGradient = ctx.createRadialGradient(
        pos.x - screwRadius/3, pos.y - screwRadius/3, 0,
        pos.x, pos.y, screwRadius
      );
      screwGradient.addColorStop(0, '#d0e3fa');
      screwGradient.addColorStop(1, '#333333');
      ctx.fillStyle = screwGradient;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(
        pos.x - Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y - Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineTo(
        pos.x + Math.cos(Math.PI / 4) * screwRadius * 0.7,
        pos.y + Math.sin(Math.PI / 4) * screwRadius * 0.7
      );
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#333333';
      ctx.stroke();
    });
    
    function drawDropShape(x: number, y: number, width: number, height: number) {
      const radius = width / 2;
      
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      
      ctx.arc(x + radius, y + radius, radius, -Math.PI, 0);
      
      ctx.quadraticCurveTo(
        x + width, y + height * 0.8,
        x + radius, y + height
      );
      
      ctx.quadraticCurveTo(
        x, y + height * 0.8,
        x, y + radius
      );
      
      ctx.closePath();
    }
    
    drawDropShape(dropX, dropY, dropWidth, dropHeight);
    ctx.fillStyle = '#f0f8ff';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1a1a1a';
    ctx.stroke();
    
    const fillHeight = dropHeight * value;
    const fillY = dropY + dropHeight - fillHeight;
    
    ctx.save();
    drawDropShape(dropX, dropY, dropWidth, dropHeight);
    ctx.clip();
    
    const waterGradient = ctx.createLinearGradient(dropX, fillY, dropX, dropY + dropHeight);
    waterGradient.addColorStop(0, '#3b82f6');
    waterGradient.addColorStop(1, '#1d4ed8');
    
    ctx.fillStyle = waterGradient;
    ctx.fillRect(dropX, fillY, dropWidth, fillHeight);
    
    const waveHeight = 3;
    const waveWidth = dropWidth;
    const waveY = fillY;
    
    const waveOffset = (Date.now() / 1000) % 2;
    
    ctx.beginPath();
    ctx.moveTo(dropX, waveY);
    
    for (let i = 0; i < waveWidth; i += 5) {
      const x = dropX + i;
      const y = waveY + Math.sin(i / 10 + waveOffset * Math.PI) * waveHeight;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(dropX + waveWidth, waveY + dropHeight);
    ctx.lineTo(dropX, waveY + dropHeight);
    ctx.closePath();
    
    ctx.fillStyle = waterGradient;
    ctx.fill();
    
    ctx.restore();
    
    const numTicks = 5;
    const tickWidth = 4;
    const tickSpacing = dropHeight / numTicks;
    
    for (let i = 0; i <= numTicks; i++) {
      const tickY = dropY + i * tickSpacing;
      
      ctx.beginPath();
      ctx.moveTo(dropX - tickWidth, tickY);
      ctx.lineTo(dropX, tickY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1a1a1a';
      ctx.stroke();
      
      const tickValue = 100 - (i * 100) / numTicks;
      ctx.font = '8px sans-serif';
      ctx.fillStyle = '#2c3e50';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${tickValue}%`, dropX - tickWidth - 2, tickY);
    }
    
    const displayValue = (value * 100).toFixed(1);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${displayValue}%`, centerX, dropY + dropHeight + 15);
  }

  function drawDefaultGauge(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    value: number, 
    gaugeColors: { bgColor: string, fgColor: string, textColor: string, accentColor: string }
  ) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2.5;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.lineWidth = radius * 0.2;
    ctx.strokeStyle = gaugeColors.bgColor;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * value), false);
    ctx.lineWidth = radius * 0.2;
    ctx.strokeStyle = gaugeColors.fgColor;
    ctx.stroke();
    
    ctx.font = `${radius * 0.5}px sans-serif`;
    ctx.fillStyle = gaugeColors.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(value * 100)}%`, centerX, centerY);
    
    const numTicks = 10;
    for (let i = 0; i <= numTicks; i++) {
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / numTicks;
      const innerRadius = radius * 0.7;
      const outerRadius = radius * 0.9;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + innerRadius * Math.cos(angle),
        centerY + innerRadius * Math.sin(angle)
      );
      ctx.lineTo(
        centerX + outerRadius * Math.cos(angle),
        centerY + outerRadius * Math.sin(angle)
      );
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.strokeStyle = '#1a1a1a';
      ctx.stroke();
    }
  }

  const getGaugeIcon = () => {
    switch (gaugeType) {
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "pressure":
        return <Gauge className="h-4 w-4" />;
      case "flow":
        return <Waves className="h-4 w-4" />;
      case "voltage":
        return <Battery className="h-4 w-4" />;
      case "current":
        return <Battery className="h-4 w-4" />;
      case "power":
        return <Zap className="h-4 w-4" />;
      case "humidity":
        return <Droplets className="h-4 w-4" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`relative ${isInDanger ? "bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-500" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span className={`flex items-center gap-1 ${isInDanger ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-gray-100"}`}>
            {getGaugeIcon()}
            {label || tag}
          </span>
          {status !== "OK" && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300 animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            width={200} 
            height={150} 
            className="mb-2"
          />
          <div className={`text-2xl font-bold ${isInDanger ? "text-red-700 dark:text-red-300" : "dark:text-white"}`}>
            {value.toFixed(2)} {unit}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
          <span>{minValue} {unit}</span>
          <span>{maxValue} {unit}</span>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-xs text-gray-600 dark:text-gray-300">Status: {status}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">ID: {tag}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">Updated: {new Date(timestamp).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}