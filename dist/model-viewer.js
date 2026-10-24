(() => {
  const viewer = document.querySelector('[data-model-viewer]');
  const stage = document.querySelector('[data-model-stage]');
  const canvas = document.querySelector('[data-model-canvas]');
  const resetButton = document.querySelector('[data-model-reset]');

  if (!viewer || !stage || !canvas) return;

  const context = canvas.getContext('2d');
  const state = {
    yaw: -0.58,
    pitch: 0.48,
    distance: 15.5,
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  };

  const meshes = [];
  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  const addMesh = (vertices, faces, color, stroke = 'rgba(231,235,255,.32)') => {
    meshes.push({ vertices, faces, color, stroke });
  };

  const addBox = (x, y, z, width, depth, height, color, stroke) => {
    const hx = width / 2;
    const hy = depth / 2;
    const hz = height / 2;
    const vertices = [
      [x - hx, y - hy, z - hz], [x + hx, y - hy, z - hz],
      [x + hx, y + hy, z - hz], [x - hx, y + hy, z - hz],
      [x - hx, y - hy, z + hz], [x + hx, y - hy, z + hz],
      [x + hx, y + hy, z + hz], [x - hx, y + hy, z + hz],
    ];
    const faces = [
      [0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
      [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
    ];
    addMesh(vertices, faces, color, stroke);
  };

  const addCylinderX = (x, y, z, length, radius, color, segments = 18) => {
    const vertices = [];
    for (let side = 0; side < 2; side += 1) {
      const px = x + (side === 0 ? -length / 2 : length / 2);
      for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        vertices.push([px, y + Math.cos(angle) * radius, z + Math.sin(angle) * radius]);
      }
    }
    const faces = [];
    for (let index = 0; index < segments; index += 1) {
      const next = (index + 1) % segments;
      faces.push([index, next, next + segments, index + segments]);
    }
    faces.push([...Array(segments).keys()].reverse());
    faces.push([...Array(segments).keys()].map((index) => index + segments));
    addMesh(vertices, faces, color, 'rgba(245,247,255,.30)');
  };

  const addTransitionWedge = () => {
    const vertices = [
      [1.8, -1.05, 1.48], [3.1, -1.05, 1.48], [2.2, -1.05, 2.22],
      [1.8, 1.05, 1.48], [3.1, 1.05, 1.48], [2.2, 1.05, 2.22],
    ];
    const faces = [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]];
    addMesh(vertices, faces, '#d8dbe5', 'rgba(255,255,255,.36)');
  };

  const buildModel = () => {
    const silver = '#c6cad5';
    const light = '#e7e9ef';
    const white = '#f4f5f8';
    const dark = '#4d5363';
    const belt = '#9da3b1';
    const accent = '#7567e8';

    // Long transport rails and belt surfaces.
    [-0.92, 0.92].forEach((y) => {
      addBox(-1.7, y, 1.02, 8.4, 0.34, 0.24, silver);
      addBox(-1.7, y, 1.17, 8.15, 0.20, 0.07, belt, 'rgba(235,238,255,.18)');
      addBox(-1.7, y - 0.22, 1.22, 8.2, 0.07, 0.25, light);
      addBox(-1.7, y + 0.22, 1.22, 8.2, 0.07, 0.25, light);
      addCylinderX(-5.95, y, 1.10, 0.30, 0.40, light);
      addCylinderX(-6.13, y, 1.10, 0.12, 0.20, dark);
    });

    // Cross members and supports.
    [-4.1, 0.35, 2.2].forEach((x) => addBox(x, 0, 0.82, 0.22, 2.25, 0.18, silver));
    [-4.1, 0.35, 2.2].forEach((x) => {
      [-1.08, 1.08].forEach((y) => {
        addBox(x, y, 0.48, 0.20, 0.20, 0.82, light);
        addBox(x, y, 0.06, 0.55, 0.48, 0.12, white);
      });
    });

    // Transfer housing, motor and sensor details.
    addTransitionWedge();
    addBox(2.58, 0, 2.02, 1.65, 1.75, 0.58, light);
    addBox(2.62, -1.02, 1.75, 0.42, 0.30, 0.38, silver);
    addBox(2.62, 1.02, 1.75, 0.42, 0.30, 0.38, silver);
    addBox(1.45, 0, 1.30, 0.52, 0.78, 0.34, white);
    addBox(0.85, -0.92, 1.44, 0.28, 0.45, 0.24, accent);

    // Elevated output conveyor.
    addBox(4.62, 0, 1.48, 3.90, 2.28, 0.18, silver);
    [-0.61, 0.61].forEach((y) => {
      addBox(4.68, y, 1.61, 3.72, 0.78, 0.08, white, 'rgba(255,255,255,.38)');
      addBox(4.68, y, 1.68, 3.48, 0.06, 0.08, '#b6b2d9');
    });
    [-1.14, 1.14].forEach((y) => addBox(4.62, y, 1.65, 3.90, 0.08, 0.34, light));
    [3.35, 5.95].forEach((x) => {
      [-1.02, 1.02].forEach((y) => {
        addBox(x, y, 0.73, 0.20, 0.20, 1.38, light);
        addBox(x, y, 0.06, 0.56, 0.50, 0.12, white);
      });
    });

    // Small rollers and mechanical accents.
    [-2.4, -0.2, 3.25, 5.95].forEach((x) => {
      addCylinderX(x, -0.92, 1.16, 0.10, 0.23, '#858b9a', 14);
      addCylinderX(x, 0.92, 1.16, 0.10, 0.23, '#858b9a', 14);
    });
  };

  const subtract = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const normalize = (vector) => {
    const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
    return vector.map((value) => value / length);
  };

  const cameraPoint = (point, width, height) => {
    const cosYaw = Math.cos(state.yaw);
    const sinYaw = Math.sin(state.yaw);
    const cosPitch = Math.cos(state.pitch);
    const sinPitch = Math.sin(state.pitch);
    const centeredZ = point[2] - 1.02;
    const rotatedX = point[0] * cosYaw - point[1] * sinYaw;
    const yawDepth = point[0] * sinYaw + point[1] * cosYaw;
    const depthAxis = yawDepth * cosPitch - centeredZ * sinPitch;
    const vertical = yawDepth * sinPitch + centeredZ * cosPitch;
    const perspectiveDepth = Math.max(1, state.distance - depthAxis);
    const focal = Math.min(width, height) * 1.65;
    return {
      x: width * 0.49 + (rotatedX * focal) / perspectiveDepth,
      y: height * 0.48 - (vertical * focal) / perspectiveDepth,
      sortDepth: depthAxis,
    };
  };

  const shadeColor = (hex, factor) => {
    const normalized = hex.replace('#', '');
    const value = Number.parseInt(normalized, 16);
    const red = clamp(Math.round(((value >> 16) & 255) * factor), 0, 255);
    const green = clamp(Math.round(((value >> 8) & 255) * factor), 0, 255);
    const blue = clamp(Math.round((value & 255) * factor), 0, 255);
    return `rgb(${red},${green},${blue})`;
  };

  const drawGrid = (width, height) => {
    context.save();
    context.lineWidth = 1;
    for (let x = -8; x <= 8; x += 1) {
      const start = cameraPoint([x, -4, 0], width, height);
      const end = cameraPoint([x, 4, 0], width, height);
      context.strokeStyle = x === 0 ? 'rgba(128,111,255,.18)' : 'rgba(160,151,255,.07)';
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    }
    for (let y = -4; y <= 4; y += 1) {
      const start = cameraPoint([-8, y, 0], width, height);
      const end = cameraPoint([8, y, 0], width, height);
      context.strokeStyle = y === 0 ? 'rgba(128,111,255,.18)' : 'rgba(160,151,255,.07)';
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    }
    context.restore();
  };

  const draw = () => {
    const bounds = canvas.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    if (!width || !height) return;

    context.clearRect(0, 0, width, height);
    drawGrid(width, height);

    const lightDirection = normalize([-0.35, -0.5, 1]);
    const projectedFaces = [];

    meshes.forEach((mesh) => {
      mesh.faces.forEach((face) => {
        const worldPoints = face.map((index) => mesh.vertices[index]);
        const points = worldPoints.map((point) => cameraPoint(point, width, height));
        const edgeA = subtract(worldPoints[1], worldPoints[0]);
        const edgeB = subtract(worldPoints[2], worldPoints[0]);
        const normal = normalize(cross(edgeA, edgeB));
        const light = Math.max(0, normal[0] * lightDirection[0] + normal[1] * lightDirection[1] + normal[2] * lightDirection[2]);
        projectedFaces.push({
          points,
          depth: points.reduce((sum, point) => sum + point.sortDepth, 0) / points.length,
          fill: shadeColor(mesh.color, 0.58 + light * 0.48),
          stroke: mesh.stroke,
        });
      });
    });

    projectedFaces.sort((a, b) => a.depth - b.depth);
    projectedFaces.forEach((face) => {
      context.beginPath();
      context.moveTo(face.points[0].x, face.points[0].y);
      face.points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.closePath();
      context.fillStyle = face.fill;
      context.fill();
      context.strokeStyle = face.stroke;
      context.lineWidth = 0.75;
      context.stroke();
    });
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw();
  };

  const reset = () => {
    state.yaw = -0.58;
    state.pitch = 0.48;
    state.distance = 15.5;
    draw();
  };

  stage.addEventListener('contextmenu', (event) => event.preventDefault());
  stage.addEventListener('pointerdown', (event) => {
    const canDrag = event.button === 2 || (event.pointerType === 'touch' && event.button === 0);
    if (!canDrag) return;
    event.preventDefault();
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    stage.setPointerCapture(event.pointerId);
    viewer.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;
    const deltaX = event.clientX - state.lastX;
    const deltaY = event.clientY - state.lastY;
    state.yaw += deltaX * 0.009;
    state.pitch = clamp(state.pitch + deltaY * 0.007, -0.12, 1.18);
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    draw();
  });

  const stopDragging = (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) return;
    state.dragging = false;
    state.pointerId = null;
    viewer.classList.remove('is-dragging');
  };

  stage.addEventListener('pointerup', stopDragging);
  stage.addEventListener('pointercancel', stopDragging);
  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    state.distance = clamp(state.distance + event.deltaY * 0.012, 9.5, 23);
    draw();
  }, { passive: false });
  stage.addEventListener('dblclick', reset);
  resetButton?.addEventListener('click', reset);

  viewer.addEventListener('keydown', (event) => {
    const actions = {
      ArrowLeft: () => { state.yaw -= 0.08; },
      ArrowRight: () => { state.yaw += 0.08; },
      ArrowUp: () => { state.pitch = clamp(state.pitch - 0.06, -0.12, 1.18); },
      ArrowDown: () => { state.pitch = clamp(state.pitch + 0.06, -0.12, 1.18); },
      '+': () => { state.distance = clamp(state.distance - 0.8, 9.5, 23); },
      '-': () => { state.distance = clamp(state.distance + 0.8, 9.5, 23); },
      Home: reset,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    draw();
  });

  buildModel();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  resize();
})();
