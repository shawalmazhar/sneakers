import React, { useState, Suspense, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, ContactShadows, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';
import * as THREE from 'three';

// --- STORE (Zustand) ---
const useStore = create((set) => ({
  cartCount: 0,
  addToCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  shoeColors: {
    sole: '#ffffff',
    laces: '#e5ff00',
    body: '#222222'
  },
  setShoeColor: (part, color) => set((state) => ({
    shoeColors: { ...state.shoeColors, [part]: color }
  })),
  checkoutOpen: false,
  setCheckoutOpen: (isOpen) => set({ checkoutOpen: isOpen })
}));

// --- 3D COMPONENTS ---
function ShoeModel({ colors }) {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) / 4;
    group.current.position.y = Math.sin(t / 1.5) / 10;
  });

  return (
    <group ref={group} dispose={null} scale={1.5}>
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[1.2, 0.2, 2.8]} />
        <meshStandardMaterial color={colors.sole} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.2, -0.2]}>
        <boxGeometry args={[1.1, 0.8, 2.2]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.1, 1.1]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[1.1, 0.6, 0.6]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, -1.2]} rotation={[-Math.PI / 8, 0, 0]}>
        <boxGeometry args={[1.1, 0.8, 0.4]} />
        <meshStandardMaterial color={colors.body} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.6, 0.4]} rotation={[Math.PI / 8, 0, 0]}>
        <boxGeometry args={[0.4, 0.1, 1.2]} />
        <meshStandardMaterial color={colors.laces} roughness={0.2} metalness={0.1} />
      </mesh>

      <Hotspot position={[0, 0.7, 0.5]} label="Adaptive Lacing Tech" />
      <Hotspot position={[-0.6, -0.4, 0]} label="Air Cushion Sole" />
      <Hotspot position={[0, 0.5, -1.3]} label="Heel Stabilizer" />
    </group>
  );
}

function Hotspot({ position, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={position}>
      <Html center zIndexRange={[100, 0]}>
        <div 
          className="hotspot"
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <AnimatePresence>
            {hovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="hotspot-content"
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Html>
    </group>
  );
}

function Scene() {
  const { shoeColors } = useStore();
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Suspense fallback={null}>
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <ShoeModel colors={shoeColors} />
        </Float>
        <Environment preset="studio" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={true} minDistance={3} maxDistance={8} maxPolarAngle={Math.PI / 2 + 0.1} />
    </Canvas>
  );
}

// --- UI COMPONENTS ---
function Header() {
  const cartCount = useStore(state => state.cartCount);
  const setCheckoutOpen = useStore(state => state.setCheckoutOpen);

  return (
    <header className="glass-panel" style={{ margin: '20px', width: 'calc(100% - 40px)' }}>
      <div className="logo">AURA-X</div>
      <nav className="nav-links">
        <a href="#">Collections</a>
        <a href="#" style={{ color: 'var(--text-primary)' }}>Custom Lab</a>
        <a href="#">Support</a>
      </nav>
      <div className="cart-icon" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setCheckoutOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span style={{ background: 'var(--accent-color)', color: '#000', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          {cartCount}
        </span>
      </div>
    </header>
  );
}

const colorPalettes = {
  body: ['#222222', '#ffffff', '#ff3366', '#0044ff'],
  sole: ['#ffffff', '#111111', '#e5ff00', '#ff9900'],
  laces: ['#e5ff00', '#ffffff', '#222222', '#ff00ff']
};

function Configurator() {
  const { shoeColors, setShoeColor, addToCart, setCheckoutOpen } = useStore();

  return (
    <div className="hero-content">
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
        <h1 className="title">AURA-X<br/>QUANTUM</h1>
        <p className="subtitle">Design your own reality. Customize every detail of the Quantum runner in real-time 3D.</p>
        
        <div className="price">$185.00</div>

        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Body Color</h3>
          <div className="color-picker">
            {colorPalettes.body.map(color => (
              <div key={color} className={`color-swatch ${shoeColors.body === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setShoeColor('body', color)} />
            ))}
          </div>

          <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Sole Core</h3>
          <div className="color-picker">
            {colorPalettes.sole.map(color => (
              <div key={color} className={`color-swatch ${shoeColors.sole === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setShoeColor('sole', color)} />
            ))}
          </div>

          <h3 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>Laces</h3>
          <div className="color-picker">
            {colorPalettes.laces.map(color => (
              <div key={color} className={`color-swatch ${shoeColors.laces === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setShoeColor('laces', color)} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-primary" onClick={addToCart}>Add to Cart</button>
          <button className="btn-primary" style={{ background: 'transparent', border: '1px solid white', color: 'white' }} onClick={() => setCheckoutOpen(true)}>Checkout</button>
        </div>
      </motion.div>
    </div>
  );
}

function ProductGrid() {
  const products = [
    { name: 'AURA-X Phantom', price: '$160' },
    { name: 'AURA-X Neon', price: '$190' },
    { name: 'AURA-X Stealth', price: '$150' }
  ];

  return (
    <section className="product-grid">
      <h2 className="grid-title">Other Models</h2>
      <div className="grid">
        {products.map((p, i) => (
          <motion.div key={i} className="card glass-panel" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
            <div className="card-img-placeholder" />
            <h3>{p.name}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>{p.price}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen } = useStore();
  const [step, setStep] = useState(1);

  if (!checkoutOpen) return null;

  return (
    <div className="checkout-modal-overlay">
      <motion.div className="checkout-modal glass-panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
        <button className="close-modal" onClick={() => setCheckoutOpen(false)}>×</button>
        <h2 style={{ marginBottom: '30px' }}>Checkout</h2>
        <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
          <div style={{ flex: 1, height: '4px', background: step >= 1 ? 'var(--accent-color)' : 'var(--glass-border)' }} />
          <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--accent-color)' : 'var(--glass-border)' }} />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3>Shipping Information</h3>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" placeholder="123 Sneaker St" />
              </div>
              <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setStep(2)}>Continue to Payment</button>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3>Payment Details</h3>
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Expiry</label>
                  <input type="text" placeholder="MM/YY" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>CVC</label>
                  <input type="text" placeholder="123" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid white', color: 'white' }} onClick={() => setStep(1)}>Back</button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => { alert("Order Placed Successfully!"); setCheckoutOpen(false); setStep(1); }}>Place Order</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- MAIN APP ---
function App() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <Configurator />
          <div className="hero-3d">
            <div className="canvas-container">
              <Scene />
            </div>
          </div>
        </section>
        <ProductGrid />
      </main>
      <CheckoutModal />
    </>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
