// IanRobotiks — Parts Library Data
const PARTS = [
  {
    id: "arduino-uno",
    name: "Arduino Uno R3",
    category: "microcontroller",
    voltage: "5V",
    current: "50mA (typical)",
    weight: "25g",
    dimensions: "68.6 × 53.4 mm",
    pins: "14 Digital I/O, 6 PWM, 6 Analog",
    description: "The classic beginner-friendly microcontroller board based on the ATmega328P.",
    useCases: "Prototyping, education, simple robots, sensor projects",
    compatible: ["hc-sr04", "sg90", "l298n", "mpu6050", "9v-battery"],
    pinout: "Digital 0-13, Analog A0-A5, 5V, 3.3V, GND, VIN"
  },
  {
    id: "esp32",
    name: "ESP32 DevKit",
    category: "microcontroller",
    voltage: "3.3V",
    current: "80-240mA",
    weight: "10g",
    dimensions: "55 × 28 mm",
    pins: "30+ GPIO, WiFi + Bluetooth",
    description: "Powerful dual-core MCU with built-in WiFi and Bluetooth. Great for IoT robots.",
    useCases: "Wireless robots, remote control, camera projects, IoT",
    compatible: ["hc-sr04", "sg90", "mpu6050", "lipo-2s"],
    pinout: "GPIO 0-39 (check board silkscreen), 3.3V, GND"
  },
  {
    id: "rpi-zero",
    name: "Raspberry Pi Zero 2 W",
    category: "microcontroller",
    voltage: "5V",
    current: "150-300mA",
    weight: "9g",
    dimensions: "65 × 30 mm",
    pins: "40-pin GPIO",
    description: "Tiny single-board computer with wireless. Runs full Linux.",
    useCases: "Vision robots, complex control, ROS projects",
    compatible: ["camera-module", "lipo-2s", "l298n"],
    pinout: "Standard 40-pin Raspberry Pi header"
  },
  {
    id: "sg90",
    name: "SG90 Micro Servo",
    category: "motor",
    voltage: "4.8–6V",
    current: "100–250mA",
    torque: "1.8 kg·cm",
    weight: "9g",
    dimensions: "22.5 × 12 × 28.5 mm",
    description: "Tiny, lightweight servo ideal for small robot arms and steering.",
    useCases: "Robot arms, pan-tilt, steering mechanisms",
    compatible: ["arduino-uno", "esp32"],
    pinout: "Signal (PWM), VCC (5V), GND"
  },
  {
    id: "tt-motor",
    name: "TT DC Gear Motor",
    category: "motor",
    voltage: "3–6V",
    current: "150–250mA",
    torque: "0.8–1.5 kg·cm",
    weight: "30g",
    dimensions: "70 × 22 × 18 mm (approx)",
    description: "Common yellow plastic gear motor used in many hobby robots.",
    useCases: "Differential drive robots, line followers, simple mobile bases",
    compatible: ["l298n", "arduino-uno", "9v-battery"],
    pinout: "Two wires (polarity determines direction)"
  },
  {
    id: "nema17",
    name: "NEMA 17 Stepper",
    category: "motor",
    voltage: "12V typical",
    current: "1.5–2A",
    torque: "40–60 N·cm",
    weight: "280g",
    dimensions: "42 × 42 × 40 mm",
    description: "Precise stepper motor widely used in 3D printers and CNC robots.",
    useCases: "Precise positioning, robotic arms, CNC",
    compatible: ["a4988", "arduino-uno"],
    pinout: "4 or 6 wires (bipolar/unipolar)"
  },
  {
    id: "hc-sr04",
    name: "HC-SR04 Ultrasonic",
    category: "sensor",
    voltage: "5V",
    current: "15mA",
    range: "2–400 cm",
    weight: "9g",
    description: "Measures distance using ultrasonic pulses. Classic obstacle avoidance sensor.",
    useCases: "Obstacle avoidance, parking sensors, level measurement",
    compatible: ["arduino-uno", "esp32"],
    pinout: "VCC, Trig, Echo, GND"
  },
  {
    id: "mpu6050",
    name: "MPU-6050 IMU",
    category: "sensor",
    voltage: "3.3–5V",
    current: "3.9mA",
    weight: "2g",
    description: "6-axis gyro + accelerometer. Essential for balancing and orientation.",
    useCases: "Self-balancing robots, drones, motion tracking",
    compatible: ["arduino-uno", "esp32"],
    pinout: "VCC, GND, SCL, SDA, XDA, XCL, AD0, INT"
  },
  {
    id: "ir-line",
    name: "IR Line Sensor Array",
    category: "sensor",
    voltage: "3.3–5V",
    current: "20–40mA",
    description: "Array of infrared reflectance sensors for line following.",
    useCases: "Line-following robots, edge detection",
    compatible: ["arduino-uno", "esp32"],
    pinout: "VCC, GND, Analog/Digital outputs"
  },
  {
    id: "9v-battery",
    name: "9V Battery + Clip",
    category: "power",
    voltage: "9V",
    capacity: "~500 mAh",
    weight: "45g",
    description: "Simple power source for low-current projects and testing.",
    useCases: "Small Arduino projects, quick prototypes",
    compatible: ["arduino-uno", "l298n"],
    pinout: "Positive and Negative terminals"
  },
  {
    id: "lipo-2s",
    name: "2S LiPo 7.4V 1000mAh",
    category: "power",
    voltage: "7.4V (nominal)",
    capacity: "1000 mAh",
    weight: "50g",
    description: "Rechargeable high-discharge battery pack for mobile robots.",
    useCases: "Mobile robots, drones, higher power projects",
    compatible: ["esp32", "l298n", "nema17"],
    pinout: "Balance connector + main discharge leads"
  },
  {
    id: "l298n",
    name: "L298N Motor Driver",
    category: "actuator",
    voltage: "5–35V (motor), 5V logic",
    current: "2A per channel",
    weight: "30g",
    description: "Dual H-bridge driver that lets a microcontroller control direction and speed of two DC motors.",
    useCases: "Differential drive robots, dual motor control",
    compatible: ["arduino-uno", "tt-motor", "9v-battery", "lipo-2s"],
    pinout: "IN1–IN4, ENA, ENB, 5V, GND, Motor A/B, VCC"
  },
  {
    id: "chassis-2wd",
    name: "2WD Robot Chassis",
    category: "structural",
    material: "Acrylic / Plastic",
    weight: "120g",
    description: "Basic two-wheel-drive chassis with motor mounts and caster.",
    useCases: "Line followers, obstacle avoiders, beginner platforms",
    compatible: ["tt-motor", "arduino-uno", "hc-sr04"],
    pinout: "N/A (mechanical)"
  },
  {
    id: "wheel-65mm",
    name: "65mm Rubber Wheel",
    category: "structural",
    dimensions: "65 mm diameter",
    weight: "25g",
    description: "Common rubber wheel that fits TT motors and many hobby gearmotors.",
    useCases: "Mobile robot bases",
    compatible: ["tt-motor", "chassis-2wd"],
    pinout: "N/A"
  }
];

const CATEGORIES = {
  microcontroller: "Microcontroller",
  motor: "Motor",
  sensor: "Sensor",
  power: "Power",
  structural: "Structural",
  actuator: "Actuator / Driver"
};

const PRINTABLE_PARTS = [
  { id: "chassis-plate", name: "Chassis Base Plate", category: "structural", material: "PLA", layer: "0.2mm", infill: "20%", time: "~2h" },
  { id: "motor-mount", name: "TT Motor Mount", category: "structural", material: "PLA", layer: "0.2mm", infill: "30%", time: "~45min" },
  { id: "wheel-hub", name: "Wheel Hub Adapter", category: "structural", material: "PLA", layer: "0.15mm", infill: "40%", time: "~30min" },
  { id: "sensor-bracket", name: "Ultrasonic Bracket", category: "structural", material: "PLA", layer: "0.2mm", infill: "20%", time: "~25min" },
  { id: "arm-link", name: "Servo Arm Link", category: "structural", material: "PLA", layer: "0.15mm", infill: "30%", time: "~40min" }
];

const MODULES = [
  { id: "electronics", title: "Electronics Basics", desc: "Voltage, current, resistance, Ohm's law, series/parallel circuits",
    content: "Voltage is electrical potential difference. Current is the flow of charge. Resistance opposes current. Ohm's Law: V = I × R. Understanding these three quantities is the foundation of all electronics and robotics." },
  { id: "microcontrollers", title: "Microcontrollers & Programming", desc: "Arduino, ESP32, Raspberry Pi — C++ and Python basics",
    content: "A microcontroller is a small computer on a chip. Arduino uses a simplified C++ (Wiring). ESP32 adds WiFi/Bluetooth. Raspberry Pi runs full Linux and is better for vision and complex software. Learn digitalWrite, analogRead, PWM, and serial communication first." },
  { id: "sensors", title: "Sensors & Actuators", desc: "Ultrasonic, IR, IMU, cameras, and how to read them",
    content: "Sensors convert physical quantities into electrical signals. Actuators convert electrical signals into motion. Always match voltage levels and use proper libraries (NewPing, Wire, etc.). Calibrate sensors for reliable behaviour." },
  { id: "motors", title: "Motors & Motion Control", desc: "DC, servo, stepper — speed, torque, and control methods",
    content: "DC motors need drivers (H-bridge) for direction and speed (PWM). Servos have built-in feedback and are controlled by pulse width. Steppers move in precise steps and are excellent for positioning. Choose based on required torque, speed, and precision." },
  { id: "power", title: "Power Systems & Batteries", desc: "Battery chemistry, capacity, voltage regulators, safety",
    content: "LiPo batteries offer high energy density but require careful charging and handling. Always use a regulator or buck converter when feeding 5V/3.3V logic from a higher battery voltage. Calculate runtime: Capacity (mAh) / Current (mA) ≈ hours." },
  { id: "mechanical", title: "Mechanical Design & 3D Printing", desc: "Chassis design, gears, linkages, and print settings",
    content: "Good mechanical design considers weight distribution, centre of mass, and structural rigidity. 3D printing lets you iterate quickly. Use 0.2 mm layer height and 20–30% infill for most structural parts. Orient parts to minimise support." },
  { id: "control", title: "Control Systems & Feedback", desc: "Open vs closed loop, PID basics, sensors for feedback",
    content: "Open-loop systems command without measuring result. Closed-loop systems use sensors to correct errors. PID (Proportional-Integral-Derivative) is the most common controller for balancing and precise motion. Start with P, then add I and D carefully." },
  { id: "kinematics", title: "Basic Kinematics", desc: "Forward and inverse kinematics for arms and mobile robots",
    content: "Forward kinematics: given joint angles, where is the end effector? Inverse kinematics: given a target position, what joint angles are needed? For differential drive robots, kinematics relate wheel speeds to linear and angular velocity of the robot." },
  { id: "ros", title: "Intro to ROS", desc: "Robot Operating System concepts and when to use it",
    content: "ROS is a middleware framework that helps different robot software components talk to each other. Nodes, topics, services, and messages are the core ideas. Use ROS when your robot needs complex sensing, navigation, or multiple processes." },
  { id: "vision", title: "AI & Computer Vision for Robots", desc: "Cameras, OpenCV basics, simple object detection",
    content: "Cameras turn robots into perception systems. OpenCV provides image processing tools. Start with colour thresholding and contour detection before moving to neural-network-based detection. Always consider lighting and computational cost on embedded hardware." }
];

const GLOSSARY = [
  { term: "PWM", def: "Pulse Width Modulation — a technique to control power to motors and brightness of LEDs by rapidly switching a signal on and off." },
  { term: "H-Bridge", def: "An electronic circuit that allows a microcontroller to control the direction of a DC motor by reversing polarity." },
  { term: "Torque", def: "Rotational force produced by a motor, usually measured in kg·cm or N·m." },
  { term: "GPIO", def: "General Purpose Input/Output pins on a microcontroller that can be configured as digital inputs or outputs." },
  { term: "I²C", def: "A two-wire serial communication protocol (SCL + SDA) commonly used by sensors such as the MPU-6050." },
  { term: "UART", def: "Universal Asynchronous Receiver-Transmitter — the hardware behind Serial communication." },
  { term: "PID", def: "Proportional-Integral-Derivative controller — a feedback control loop widely used in robotics for stability and precision." },
  { term: "LiPo", def: "Lithium Polymer battery — high energy density rechargeable battery common in mobile robots and drones." },
  { term: "Differential Drive", def: "A mobile robot drive system using two independently driven wheels (and usually a caster)." },
  { term: "Forward Kinematics", def: "Calculating the position of a robot's end effector from its joint angles." },
  { term: "Inverse Kinematics", def: "Calculating the joint angles required to place an end effector at a desired position." },
  { term: "ROS", def: "Robot Operating System — a flexible framework for writing robot software." }
];
