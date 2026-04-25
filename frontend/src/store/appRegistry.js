/**
 * APP_REGISTRY
 * ------------
 * Defines every application that can be launched on the virtual desktop.
 */

export const APP_REGISTRY = [
  {
    id: "word",
    label: "Word",
    icon: "W",
    description: "Draft and edit documents",
    defaultSize: { width: 980, height: 640 },
    showInDock: false,
    showOnDesktop: true,
  },
  {
    id: "excel",
    label: "Excel",
    icon: "X",
    description: "Work with spreadsheets and tables",
    defaultSize: { width: 1000, height: 650 },
    showInDock: false,
    showOnDesktop: true,
  },
  {
    id: "powerpoint",
    label: "PowerPoint",
    icon: "P",
    description: "Create and review slide decks",
    defaultSize: { width: 1020, height: 650 },
    showInDock: false,
    showOnDesktop: true,
  },
  {
    id: "meeting",
    label: "Teams",
    icon: "T",
    description: "Join the Teams meeting interface",
    defaultSize: { width: 1080, height: 680 },
    showInDock: false,
    showOnDesktop: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "A",
    description: "Opportunity intelligence and forecasting workspace",
    defaultSize: { width: 1160, height: 700 },
    showInDock: false,
    showOnDesktop: false,
  },
  {
    id: "outlook",
    label: "Outlook",
    icon: "O",
    description: "Read mail and schedule updates",
    defaultSize: { width: 980, height: 620 },
    showInDock: true,
    showOnDesktop: true,
  },
  {
    id: "onenote",
    label: "OneNote",
    icon: "N",
    description: "Capture notes and ideas",
    defaultSize: { width: 900, height: 580 },
    showInDock: true,
    showOnDesktop: true,
  },
  {
    id: "rfp-dashboard",
    label: "RFP Dashboard",
    icon: "R",
    description: "View and manage RFP pipeline outputs",
    defaultSize: { width: 1000, height: 620 },
    showInDock: false,
    showOnDesktop: false,
  },
  {
    id: "pipeline",
    label: "Pipeline Runner",
    icon: "G",
    description: "Trigger and monitor the RFP processing pipeline",
    defaultSize: { width: 720, height: 480 },
    showInDock: true,
    showOnDesktop: false,
  },
  {
    id: "sources",
    label: "Source Manager",
    icon: "S",
    description: "Add and manage RFP source URLs",
    defaultSize: { width: 640, height: 420 },
    showInDock: true,
    showOnDesktop: false,
  },
];

export function getApp(id) {
  return APP_REGISTRY.find((app) => app.id === id) ?? null;
}
