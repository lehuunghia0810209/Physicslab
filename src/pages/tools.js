import { UNITS, convert, format } from '../core/units.js';
import { icon } from '../app/icons.js';
import { analyzeMeasurements } from '../core/measurement-analysis.js';
import { mountVectorPlayground } from './vector-playground.js';
import { mountMotionProbeWorkbench } from './motion-probe-workbench.js';
import '../styles/remake-studio.css';

export function mount(main) {
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">CÔNG CỤ CHO NHỮNG CÂU HỎI NHỎ</p><h1>Bàn công cụ</h1><p>Thực hành với dụng cụ đo chuyển động và vectơ lực. Các phép tính, đổi đơn vị và sao lưu tiến độ nằm ở phía dưới.</p></div></div><div class="tools-layout"><section class="panel"><span class="tag">ĐỔI ĐƠN VỊ</span><h2>Từ đại lượng đến đơn vị</h2><label class="field">Đại lượng<select id="family"><option value="speed">Vận tốc</option><option value="length">Độ dài</option><option value="time">Thời gian</option></select></label><label class="field">Giá trị<input id="amount" type="number" value="20" step="any"></label><div class="unit-pair"><label class="field">Từ<select id="from"></select></label>${icon('arrow')}<label class="field">Sang<select id="to"></select></label></div><output id="conversion" class="conversion-output" aria-live="polite"></output></section><section class="panel"><span class="tag">CÔNG THỨC NỀN TẢNG</span><h2>Ném xiên trong trọng trường đều</h2><div class="equation-box">vₓ = v₀ cos(θ)<br>vᵧ = v₀ sin(θ) − gt<br>x = v₀ cos(θ)t<br>y = h₀ + v₀ sin(θ)t − ½gt²</div><p>SI: vận tốc m/s, thời gian s, độ dài m, gia tốc m/s². Góc hiển thị theo độ và được đổi sang radian khi tính.</p><p>Với h₀ = 0: R = v₀² sin(2θ)/g. Công thức tầm xa này chỉ dùng khi độ cao phóng và chạm đất bằng nhau.</p><a class="button secondary" href="#/simulation/projectile-motion">Đối chiếu với mô phỏng ${icon('arrow')}</a></section><section class="panel" aria-labelledby="measurement-tool-title"><span class="tag">XỬ LÝ SỐ LIỆU</span><h2 id="measurement-tool-title">Phân tích phép đo lặp</h2><label class="field">Các số đo, cách nhau bằng dấu chấm phẩy hoặc khoảng trắng<input id="measurement-values" type="text" value="1,98; 2,01; 2,00; 2,02" aria-label="Các số đo lặp"></label><label class="field">Độ chia dụng cụ<input id="measurement-resolution" type="number" min="0" step="any" value="0.01" aria-label="Độ chia dụng cụ"></label><output id="measurement-analysis" class="conversion-output" aria-live="polite"></output><p>Sử dụng độ lệch chuẩn mẫu, sai số chuẩn của trung bình và độ không đảm bảo loại B với phân bố chữ nhật.</p></section><section class="panel explorer3d-card"><span class="tag">KHÔNG GIAN BA CHIỀU</span><h2>Mô hình Lorentz và ném xiên</h2><p>Xoay góc nhìn để phân biệt quỹ đạo xoắn ốc của hạt tích điện và quỹ đạo ném xiên trong trọng trường.</p><a class="button primary" href="#/explorer3d">Mở trình khám phá 3D ${icon('arrow')}</a></section><section class="panel" aria-labelledby="backup-tools-title"><span class="tag">DỮ LIỆU CÁ NHÂN</span><h2 id="backup-tools-title">Sao lưu và khôi phục dữ liệu</h2><p>Bản sao đầy đủ gồm tiến độ, Learning 3.0 và Experiment Studio. Tệp cũ chỉ chứa tiến độ vẫn được hỗ trợ; dữ liệu khác không bị xóa khi nhập loại tệp này.</p><div class="action-row"><button class="button secondary" id="tools-export-progress" type="button">Sao lưu đầy đủ JSON</button><button class="button secondary" id="tools-import-progress" type="button">Khôi phục từ JSON</button><button class="button ghost" id="tools-rescue-raw" type="button">Cứu hộ dữ liệu gốc</button></div><p id="backup-tools-status" class="helper-text" role="status" aria-live="polite">Hãy sao lưu trước khi chuyển thiết bị. Cứu hộ dữ liệu gốc dành cho kho bị hỏng hoặc khác phiên bản.</p></section><section class="panel" aria-labelledby="teacher-tools-title"><span class="tag">CHẾ ĐỘ GIÁO VIÊN</span><h2 id="teacher-tools-title">Điều khiển lớp học nhanh</h2><p>Bật vai trò giáo viên, vào trình chiếu toàn màn hình và chia sẻ nhanh các tình huống khám phá từ một giao diện tập trung.</p><div class="action-row"><button class="button secondary" id="tools-role-toggle" type="button">Chuyển sang giáo viên</button><button class="button primary" id="tools-presentation-toggle" type="button">Bật trình chiếu</button></div><div class="teacher-note"><strong>Gợi ý dùng trên lớp</strong><ul><li>Chọn mô phỏng → đặt thông số mẫu → dùng nút “Trình chiếu”.</li><li>Sau bài học, dùng “Sao lưu đầy đủ JSON” để giữ tiến độ, ghi chú và các lượt thí nghiệm.</li><li>Trình chiếu không cần tài khoản hay backend.</li></ul></div></section></div>`;

  const toolsAbort = new AbortController();
  const toolsHeading = main.querySelector('.page-heading');
  toolsHeading?.insertAdjacentHTML('afterend', '<section class="vector-showcase" id="physics-vector-workbench" aria-label="Bàn thí nghiệm tổng hợp lực tương tác"></section>');
  const disposeVector = mountVectorPlayground(main.querySelector('#physics-vector-workbench'));
  const motionRoot=document.createElement('section');motionRoot.className='motion-probe-workbench';motionRoot.id='physics-motion-measurement';motionRoot.setAttribute('aria-label','Thước thời gian và quỹ đạo tương tác');
  main.querySelector('#physics-vector-workbench').insertAdjacentElement('afterend',motionRoot);
  const disposeMotion=mountMotionProbeWorkbench(motionRoot);
  const family = main.querySelector('#family');
  const from = main.querySelector('#from');
  const to = main.querySelector('#to');
  function update() {
    const value = main.querySelector('#amount').valueAsNumber;
    try { main.querySelector('#conversion').textContent = `${format(convert(value, family.value, from.value, to.value), 4)} ${to.value}`; }
    catch { main.querySelector('#conversion').textContent = 'Nhập một số hữu hạn để đổi đơn vị.'; }
  }
  function options() {
    const names = Object.keys(UNITS[family.value]);
    from.innerHTML = to.innerHTML = names.map(n => `<option>${n}</option>`).join('');
    to.selectedIndex = 1;
    update();
  }
  family.addEventListener('change', options);
  for (const el of [from, to, main.querySelector('#amount')]) el.addEventListener('input', update);
  options();

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

  const backupStatus = main.querySelector('#backup-tools-status');
  main.querySelector('#tools-export-progress').addEventListener('click', async () => {
    try {
      await window.PhysicsLabApp?.exportProgressBackup?.();
      backupStatus.textContent = 'Đã tạo bản sao gồm Progress, Learning 3.0 và Experiment Studio.';
    } catch (error) { backupStatus.textContent = `Không thể sao lưu: ${error.message}`; }
  });
  main.querySelector('#tools-import-progress').addEventListener('click', () => {
    window.PhysicsLabApp?.promptProgressImport?.();
    backupStatus.textContent = 'Chọn tệp JSON để khôi phục. Bản cứu hộ dữ liệu gốc sẽ được tải trước khi thay thế.';
  });
  main.querySelector('#tools-rescue-raw').addEventListener('click', async () => {
    try {
      await window.PhysicsLabApp?.exportRawRescue?.();
      backupStatus.textContent = 'Đã tạo tệp cứu hộ chứa nguyên văn các kho lưu trữ hiện có.';
    } catch (error) { backupStatus.textContent = `Không thể cứu hộ: ${error.message}`; }
  });

  const roleButton = main.querySelector('#tools-role-toggle');
  const presentationButton = main.querySelector('#tools-presentation-toggle');
  function syncTeacherButtons() {
    const teacher = document.body.dataset.role === 'teacher';
    roleButton.textContent = teacher ? 'Chuyển sang học sinh' : 'Chuyển sang giáo viên';
    presentationButton.textContent = document.body.classList.contains('presentation-mode') ? 'Tắt trình chiếu' : 'Bật trình chiếu';
    presentationButton.disabled = !teacher;
  }
  roleButton.addEventListener('click', () => {
    const teacher = document.body.dataset.role !== 'teacher';
    window.PhysicsLabApp?.setRole?.(teacher ? 'teacher' : 'student');
    syncTeacherButtons();
  });
  presentationButton.addEventListener('click', () => {
    if (document.body.dataset.role !== 'teacher') {
      window.PhysicsLabApp?.setRole?.('teacher');
    }
    window.PhysicsLabApp?.togglePresentation?.();
    syncTeacherButtons();
  });
  window.addEventListener('physicslab:rolechange', syncTeacherButtons, {signal:toolsAbort.signal});
  window.addEventListener('physicslab:presentationchange', syncTeacherButtons, {signal:toolsAbort.signal});
  syncTeacherButtons();
  return () => { toolsAbort.abort(); disposeVector(); disposeMotion(); };
}
