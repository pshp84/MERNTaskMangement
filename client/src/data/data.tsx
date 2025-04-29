import {
    ArrowDown,
    ArrowRight,
    ArrowUp,
    CheckCircle,
    Circle,
    CircleOff,
    HelpCircle,
    Timer,
  } from "lucide-react"
  
  export const labels = [
    {
      value: "bug",
      label: "Bug",
    },
    {
      value: "feature",
      label: "Feature",
    },
    {
      value: "documentation",
      label: "Documentation",
    },
  ]
  
  export const statuses = [
  
    {
      value: "To Do",
      label: "Todo", 
      icon: Circle,
    },
    {
      value: "In Progress",
      label: "In Progress",
      icon: Timer,
    },
    {
      value: "Done",
      label: "Done",
      icon: CheckCircle,
    },
  ]
  
  export const priorities = [
    {
      label: "Low",
      value: "Low",
      icon: ArrowDown,
    },
    {
      label: "Medium",
      value: "Medium",
      icon: ArrowRight,
    },
    {
      label: "High",
      value: "High",
      icon: ArrowUp,
    },
  ]