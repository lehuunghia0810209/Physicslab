/** Structural mapping for stage-first navigation. Every simulation puts a usable
 * hands-on scene above long explanations, teacher controls and discovery tasks. */
export const SIMULATION_STAGE_SELECTORS = Object.freeze({
  'projectile-motion':'.simulation-layout,.mechanics-layout',
  'inclined-plane':'.simulation-layout,.mechanics-layout',
  'newton':'.simulation-layout,.mechanics-layout',
  'friction':'.simulation-layout,.mechanics-layout',
  'work-energy':'.simulation-layout,.mechanics-layout',
  'momentum-collision':'.simulation-layout,.mechanics-layout',
  'spring-oscillation':'.simulation-layout,.mechanics-layout',
  'wave-on-string':'.wave-viewport',
  'electric-circuits':'#circuit-construction-workbench',
  'electric-field':'.field-layout',
  'magnetic-field':'.em-layout',
  'lens':'.optics-layout',
  'ideal-gas':'.gas-layout'
});
