import { UNITS, convert, format } from '../core/units.js';
import { icon } from '../app/icons.js';
import { analyzeMeasurements } from '../core/measurement-analysis.js';
export function mount(main) {
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">CÔNG CỤ CHO NHỮNG CÂU HỎI NHỎ</p><h1>Bàn công cụ</h1><p>Đơn vị nhất quán là nền tảng của một phép đo đúng.</p></div></div><div class="tools-layout"><section class="panel"><span class="tag">ĐỔI ĐƠN VỊ</span><h2>Từ đại lượng đến đơn vị</h2><label class="field">Đại lượng<select id="family"><option value="speed">Vận tốc</option><option value="length">Độ dài</option><option value="time">Thời gian</option></select></label><label class="field">Giá trị<input id="amount" type="number" value="20" step="any"></label><div class="unit-pair"><label class="field">Từ<select id="from"></select></label>${icon('arrow')}<label class="field">Sang<select id="to"></select></label></div><output id="conversion" class="conversion-output" aria-live="polite"></output></section><section class="panel"><span class="tag">CÔNG THỨC NỀN TẢNG</span><h2>Ném xiên trong trọng trường đều</h2><div class="equation-box">vₓ = v₀ cos(θ)<br>vᵧ = v₀ sin(θ) − gt<br>x = v₀ cos(θ)t<br>y = h₀ + v₀ sin(θ)t − ½gt²</div><p>SI: vận tốc m/s, thời gian s, độ dài m, gia tốc m/s². Góc hiển thị theo độ và được đổi sang radian khi tính.</p><p>Với h₀ = 0: R = v₀² sin(2θ)/g. Công thức tầm xa này chỉ dùng khi độ cao phóng và chạm đất bằng nhau.</p><a class="button secondary" href="#/simulation/projectile-motion">Đối chiếu với mô phỏng ${icon('arrow')}</a></section><section class="panel" aria-labelledby="measurement-tool-title"><span class="tag">XỬ LÝ SỐ LIỆU</span><h2 id="measurement-tool-title">Phân tích phép đo lặp</h2><label class="field">Các số đo, cách nhau bằng dấu chấm phẩy hoặc khoảng trắng<input id="measurement-values" type="text" value="1,98; 2,01; 2,00; 2,02" aria-label="Các số đo lặp"></label><label class="field">Độ chia dụng cụ<input id="measurement-resolution" type="number" min="0" step="any" value="0.01" aria-label="Độ chia dụng cụ"></label><output id="measurement-analysis" class="conversion-output" aria-live="polite"></output><p>Sử dụng độ lệch chuẩn mẫu, sai số chuẩn của trung bình và độ không đảm bảo loại B với phân bố chữ nhật.</p></section><section class="panel explorer3d-card"><span class="tag">KHÔNG GIAN BA CHIỀU</span><h2>Mô hình Lorentz và ném xiên</h2><p>Xoay góc nhìn để phân biệt quỹ đạo xoắn ốc của hạt tích điện và quỹ đạo ném xiên trong trọng trường.</p><a class="button primary" href="#/explorer3d">Mở trình khám phá 3D ${icon('arrow')}</a></section></div>`;
  const family = main.querySelector('#family'); const from = main.querySelector('#from'); const to = main.querySelector('#to');
  function update() { const value = main.querySelector('#amount').valueAsNumber; try { main.querySelector('#conversion').textContent = `${format(convert(value, family.value, from.value, to.value), 4)} ${to.value}`; } catch { main.querySelector('#conversion').textContent = 'Nhập một số hữu hạn để đổi đơn vị.'; } }
  function options() { const names = Object.keys(UNITS[family.value]); from.innerHTML = to.innerHTML = names.map(n => `<option>${n}</option>`).join(''); to.selectedIndex = 1; update(); }
  family.addEventListener('change', options); for (const el of [from, to, main.querySelector('#amount')]) el.addEventListener('input', update); options();
  const measurementValues = main.querySelector('#measurement-values');
  const resolution = main.querySelector('#measurement-resolution');
  const analysis = main.querySelector('#measurement-analysis');
  function updateMeasurementAnalysis() {
    try {
      const values = measurementValues.value.trim().split(/[;\s]+/).filter(Boolean).map(value => Number(value.replace(',', '.')));
      const result = analyzeMeasurements(values, Number(resolution.value.replace(',', '.')));
      analysis.textContent = `n = ${result.count} · x̄ = ${format(result.mean, 4)}`;
      analysis.textContent += ` · s = ${format(result.standardDeviation, 4)} · u(x̄) = ${format(result.combinedUncertainty, 4)}`;
      if (result.relativeUncertainty !== null) analysis.textContent += ` · sai số tương đối = ${format(result.relativeUncertainty * 100, 2)}%`;
    } catch (error) {
      analysis.textContent = error.message;
    }
  }
  measurementValues.addEventListener('input', updateMeasurementAnalysis);
  resolution.addEventListener('input', updateMeasurementAnalysis);
  updateMeasurementAnalysis();
}
