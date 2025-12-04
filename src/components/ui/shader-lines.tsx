"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    THREE: any
  }
}

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: any
    scene: any
    renderer: any
    uniforms: any
    animationId: number | null
    lastFrameTime: number
    isVisible: boolean
  }>({
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
    lastFrameTime: 0,
    isVisible: true,
  })

  useEffect(() => {
    // Delay shader initialization to prioritize LCP
    const initTimer = setTimeout(() => {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js"
      script.onload = () => {
        if (containerRef.current && window.THREE) {
          initThreeJS()
        }
      }
      document.head.appendChild(script)
    }, 300)

    // Visibility detection - pause when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          sceneRef.current.isVisible = entry.isIntersecting
          if (entry.isIntersecting && sceneRef.current.renderer && !sceneRef.current.animationId) {
            animate(performance.now())
          }
        })
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      clearTimeout(initTimer)
      if (sceneRef.current.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId)
      }
      if (sceneRef.current.renderer) {
        sceneRef.current.renderer.dispose()
      }
      observer.disconnect()
    }
  }, [])

  const initThreeJS = () => {
    if (!containerRef.current || !window.THREE) return

    const THREE = window.THREE
    const container = containerRef.current

    container.innerHTML = ""

    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()

    const geometry = new THREE.PlaneBufferGeometry(2, 2)

    const uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
    }

    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;
        
      float random (in float x) {
          return fract(sin(x)*1e4);
      }
      float random (vec2 st) {
          return fract(sin(dot(st.xy,
                               vec2(12.9898,78.233)))*
              43758.5453123);
      }
      
      varying vec2 vUv;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256,256);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);       
          
        float t = time*0.06+random(uv.x)*0.4;
        float lineWidth = 0.0008;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));        
          }
        }

        gl_FragColor = vec4(color[2],color[1],color[0],1.0);
      }
    `

    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Cap pixel ratio at 1.5 for performance
    const renderer = new THREE.WebGLRenderer()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    container.appendChild(renderer.domElement)

    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: null,
      lastFrameTime: 0,
      isVisible: true,
    }

    const onWindowResize = () => {
      const rect = container.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height)
      uniforms.resolution.value.x = renderer.domElement.width
      uniforms.resolution.value.y = renderer.domElement.height
    }

    onWindowResize()
    window.addEventListener("resize", onWindowResize, false)

    animate(performance.now())
  }

  const animate = (timestamp: number) => {
    const { renderer, scene, camera, uniforms, isVisible, lastFrameTime } = sceneRef.current
    
    if (!renderer || !isVisible) {
      sceneRef.current.animationId = null
      return
    }

    // 30fps cap (~33ms between frames)
    const elapsed = timestamp - lastFrameTime
    if (elapsed < 33) {
      sceneRef.current.animationId = requestAnimationFrame(animate)
      return
    }
    
    sceneRef.current.lastFrameTime = timestamp
    uniforms.time.value += 0.02 // Slower time increment
    renderer.render(scene, camera)
    sceneRef.current.animationId = requestAnimationFrame(animate)
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute" 
      style={{ willChange: 'transform', contain: 'layout style paint' }}
    />
  )
}
