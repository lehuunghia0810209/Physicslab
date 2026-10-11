import { guideForSimulation } from '../data/experiment-guides.js';
/** Adds help without changing model logic, progress or simulation event handlers. */
export function addExperimentGuide(main, simulationId) {
  const steps = guideForSimulation(simulationId);
  if (!steps || main.querySelector('.experiment-guide')) return;
  const details = document.createElement('details');
  details.className = 'experiment-guide';
  details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'Hướng dẫn khám phá · 3 bước';
  const paragraph = document.createElement('p');
  paragraph.textContent = 'Hãy thử tự tương tác với thí nghiệm trước khi đọc câu trả lời. Các thanh điều chỉnh vẫn dùng được bằng bàn phím.';
  const list = document.createElement('ol');
  const names = ['Thử', 'Quan sát', 'Giải thích'];
  steps.forEach((step, index) => {
    const item = document.createElement('li');
    const name = document.createElement('strong'); name.textContent = `${names[index]}: `;
    item.append(name, document.createTextNode(step));
    list.append(item);
  });
  details.append(summary, paragraph, list);
  const heading = main.querySelector('.page-heading');
  if (heading) heading.insertAdjacentElement('afterend', details);
  else main.prepend(details);
}
