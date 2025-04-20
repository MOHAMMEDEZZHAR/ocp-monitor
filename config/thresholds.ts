export interface TagThreshold {
  tag: string
  label: string
  min: number
  max: number
  unit: string
}

export const defaultThresholds: TagThreshold[] = [
  { tag: "Tag_1001", label: "CPU Temperature", min: 1, max: 15, unit: "°C" },
  { tag: "Tag_1002", label: "System Pressure", min: 1, max: 1, unit: "bar" },
  { tag: "Tag_1003", label: "Flow Rate", min: -3, max: 3, unit: "L/min" },
  { tag: "Tag_1004", label: "Voltage", min: -3, max: 3, unit: "V" },
  { tag: "Tag_1005", label: "Current", min: -3, max: 2, unit: "A" },
  { tag: "Tag_1006", label: "Power", min: -3, max: 3, unit: "kW" },
  { tag: "Tag_1007", label: "Humidity", min: 0, max: 10, unit: "%" },
]
