import './electricity.css';
import { mountCircuitWorkbench } from '../../pages/circuit-workbench.js';

/** The simulation and Virtual Lab intentionally share one construction bench and solver. */
export function mount(main, context) {
  const { progress } = context;
  const id = 'electric-circuits';
  let snapshot = {
    bench: { components: [], wires: [] }, samples: [], playing: false,
    measurements: { status: 'open', message: '', totalCurrent: 0, totalPower: 0, currents: {}, voltages: {}, powers: {} }
  };
  progress.visit(id, 'Tự lắp và đo mạch điện một chiều');
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">ĐIỆN HỌC · LỚP 11</p><h1>Lắp mạch điện một chiều</h1><p>Kéo linh kiện, nối dây, đóng công tắc và đặt đồng hồ đo trên chính mạch bạn tạo.</p></div><a class="button secondary" href="#/simulations">Quay lại thư viện</a></div><div id="circuit-construction-workbench"></div>`;

  const expose = state => {
    snapshot = state;
    context.activeSimulation = () => ({
      id,
      parameters: { componentCount: snapshot.bench.components.length, wireCount: snapshot.bench.wires.length },
      state: { time: 0, playing: snapshot.playing, rate: 1 },
      measurements: snapshot.measurements,
      graphs: []
    });
  };
  const disposeWorkbench = mountCircuitWorkbench(main.querySelector('#circuit-construction-workbench'), {
    onState: expose,
    onRecord: () => progress.complete(id)
  });
  expose(snapshot);
  return () => {
    disposeWorkbench();
    context.activeSimulation = null;
  };
}
