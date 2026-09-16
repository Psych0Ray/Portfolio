/* ══ Rutujeet · procedural low-poly objects for the hobby slides ═══
   No downloaded models. Each object is built from primitives, flat-shaded
   in the site palette, so it reads as a riso-print object on purpose.
   <canvas data-model="controller|clapper|pot|helmet">
   Renders only while on screen. Drag to spin. Reduced motion: static.  */
(function(){
  if (typeof THREE === 'undefined') return;
  var C = { ink:0x0A0A0A, blue:0x002FA7, bone:0xE8DCC8, paper:0xF2EFE6 };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mat(c){ return new THREE.MeshStandardMaterial({ color:c, flatShading:true, roughness:.95, metalness:0 }); }
  function box(w,h,d,c){ return new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(c)); }
  function cyl(rt,rb,h,c,seg){ return new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||22), mat(c)); }
  function sph(r,c,ps,pl,ts,tl){ return new THREE.Mesh(new THREE.SphereGeometry(r,24,16,ps||0,pl||Math.PI*2,ts||0,tl||Math.PI), mat(c)); }
  function tor(r,t,c,arc){ return new THREE.Mesh(new THREE.TorusGeometry(r,t,10,36,arc||Math.PI*2), mat(c)); }
  function at(m,x,y,z){ m.position.set(x,y,z); return m; }

  var build = {
    controller: function(g){
      g.add(box(2.7,.9,1.15,C.ink));
      [-1,1].forEach(function(s){ var gr = at(box(.85,1.5,.95,C.ink), s*1.12,-.75,.05); gr.rotation.z = -s*.28; g.add(gr); });
      g.add(at(box(.56,.16,.17,C.bone), -.78,.5,.3));
      g.add(at(box(.17,.16,.56,C.bone), -.78,.5,.3));
      [[0,.3],[0,-.3],[.3,0],[-.3,0]].forEach(function(o){ g.add(at(cyl(.15,.15,.16,C.blue,18), .78+o[0],.53,.3+o[1])); });
      [-.36,.36].forEach(function(x){ g.add(at(cyl(.11,.11,.34,C.ink,14), x,.58,-.15)); g.add(at(sph(.21,C.blue), x,.8,-.15)); });
      g.add(at(box(1.0,.14,.16,C.bone), 0,.5,-.5));
      g.scale.setScalar(.78);
    },
    clapper: function(g){
      g.add(at(box(2.7,1.9,.18,C.ink), 0,-.55,0));
      for (var i=0;i<4;i++) g.add(at(box(.34,.5,.2,C.blue), -1.0+i*.67,.15,0));
      var top = new THREE.Group(); top.position.set(-1.35,.4,0); top.rotation.z = .22;
      top.add(at(box(2.7,.5,.2,C.bone), 1.35,.25,0));
      for (var j=0;j<4;j++) top.add(at(box(.34,.52,.22,C.blue), .35+j*.67,.25,0));
      g.add(top);
      g.add(at(box(1.6,.36,.03,C.bone), 0,-.35,.1));
      g.add(at(box(1.2,.05,.04,C.ink), 0,-.35,.12));
      g.scale.setScalar(.9);
    },
    pot: function(g){
      g.add(at(cyl(1.1,.98,1.35,C.blue,28), 0,-.35,0));
      var rim = at(tor(1.12,.07,C.ink), 0,.33,0); rim.rotation.x = Math.PI/2; g.add(rim);
      g.add(at(cyl(1.18,1.18,.14,C.bone,28), 0,.44,0));
      g.add(at(sph(.19,C.ink), 0,.64,0));
      [-1,1].forEach(function(s){ var h = at(tor(.3,.06,C.ink,Math.PI), s*1.16,0,0); h.rotation.z = Math.PI/2; h.rotation.y = s*Math.PI/2; g.add(h); });
      g.add(at(cyl(.95,.95,.08,C.ink,28), 0,-1.06,0));
    },
    helmet: function(g){
      g.add(at(sph(1.25,C.blue,0,Math.PI*2,0,Math.PI*.72), 0,.15,0));
      g.add(at(cyl(1.24,1.1,.55,C.blue,28), 0,-.55,0));
      g.add(at(box(1.5,.42,.7,C.blue), 0,-.62,.72));
      var visor = at(sph(1.28,C.ink,Math.PI*.08,Math.PI*.84,Math.PI*.28,Math.PI*.3), 0,.15,0);
      visor.material.side = THREE.DoubleSide; g.add(visor);
      var stripe = at(tor(1.29,.06,C.bone,Math.PI), 0,.15,0); stripe.rotation.y = Math.PI/2; g.add(stripe);
    }
  };

  document.querySelectorAll('canvas[data-model]').forEach(function(cv){
    var kind = cv.getAttribute('data-model'); if (!build[kind]) return;
    var renderer = new THREE.WebGLRenderer({ canvas:cv, alpha:true, antialias:true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(30, 1, .1, 100); cam.position.set(0,.5,7.2); cam.lookAt(0,-.1,0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 1.15));
    var sun = new THREE.DirectionalLight(0xffffff, .85); sun.position.set(3,5,4); scene.add(sun);
    var g = new THREE.Group(); build[kind](g); g.rotation.x = .22; scene.add(g);
    var shadow = new THREE.Mesh(new THREE.CircleGeometry(1.35,40), new THREE.MeshBasicMaterial({ color:C.ink, transparent:true, opacity:.14 }));
    shadow.rotation.x = -Math.PI/2; shadow.position.y = -1.85; scene.add(shadow);

    function size(){ var p = cv.parentElement, w = p.clientWidth, h = p.clientHeight; if (!w || !h) return;
      renderer.setSize(w,h,false); cam.aspect = w/h; cam.updateProjectionMatrix(); }
    size(); new ResizeObserver(size).observe(cv.parentElement);

    var live = true;
    new IntersectionObserver(function(e){ live = e[0].isIntersecting; }, { threshold:.05 }).observe(cv);

    var drag = null;
    cv.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, ry:g.rotation.y }; });
    window.addEventListener('pointerup', function(){ drag = null; });
    window.addEventListener('pointermove', function(e){ if (drag) g.rotation.y = drag.ry + (e.clientX - drag.x) * .01; }, { passive:true });

    var t = 0;
    (function loop(){
      requestAnimationFrame(loop);
      if (!live) return;
      t += .016;
      if (!drag && !REDUCED) g.rotation.y += .009;
      g.position.y = REDUCED ? 0 : Math.sin(t*1.4) * .12;
      var s = 1 - g.position.y * .5; shadow.scale.set(s,s,1);
      renderer.render(scene, cam);
    })();
  });
})();
