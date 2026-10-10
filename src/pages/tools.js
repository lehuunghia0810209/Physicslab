import { UNITS, convert, format } from '../core/units.js';
import { icon } from '../app/icons.js';
import { analyzeMeasurements } from '../core/measurement-analysis.js';

export function mount(main) {
  main.innerHTML = `<div class="page-heading"><div><p class="eyebrow">CÔNG CỤ CHO NHỮNG CÂU HỎI NHỎ</p><h1>Bàn công cụ</h1><p>Đơn vị nhất quán là nền tảng của một phép đo đúng. PhysicsLab 1.2 β1 cũng gom các tiện ích sao lưu và chế độ giáo viên về đây để giao diện mô phỏng gọn gàng hơn.</p></div></div><div class="tools-layout"><section class="panel"><span class="tag">ĐỔI ĐƠN VỊ</span><h2>Từ đại lượng đến đơn vị</h2><label class="field">Đại lượng<select id="family"><option value="speed">Vận tốc</option><option value="length">Độ dài</option><option value="time">Thời gian</option></select></label><label class="field">Giá trị<input id="amount" type="number" value="20" step="any"></label><div class="unit-pair"><label class="field">Từ<select id="from"></select></label>${icon('arrow')}<label class="field">Sang<select id="to"></select></label></div><output id="conversion" class="conversion-output" aria-live="polite"></output></section><section class="panel"><span class="tag">CÔNG THỨC NỀN TẢNG</span><h2>Ném xiên trong trọng trường đều</h2><div class="equation-box">vₓ = v₀ cos(θ)<br>vᵧ = v₀ sin(θ) − gt<br>x = v₀ cos(θ)t<br>y = h₀ + v₀ sin(θ)t − ½gt²</div><p>SI: vận tốc m/s, thời gian s, độ dài m, gia tốc m/s². Góc hiển thị theo độ và được đổi sang radian khi tính.</p><p>Với h₀ = 0: R = v₀² sin(2θ)/g. Công thức tầm xa này chỉ dùng khi độ cao phóng và chạm đất bằng nhau.</p><a class="button secondary" href="#/simulation/projectile-motion">Đối chiếu với mô phỏng ${icon('arrow')}</a></section><section class="panel" aria-labelledby="measurement-tool-title"><span class="tag">XỬ LÝ SỐ LIỆU</span><h2 id="measurement-tool-title">Phân tích phép đo lặp</h2><label class="field">Các số đo, cách nhau bằng dấu chấm phẩy hoặc khoảng trắng<input id="measurement-values" type="text" value="1,98; 2,01; 2,00; 2,02" aria-label="Các số đo lặp"></label><label class="field">Độ chia dụng cụ<input id="measurement-resolution" type="number" min="0" step="any" value="0.01" aria-label="Độ chia dụng cụ"></label><output id="measurement-analysis" class="conversion-output" aria-live="polite"></output><p>Sử dụng độ lệch chuẩn mẫu, sai số chuẩn của trung bình và độ không đảm bảo loại B với phân bố chữ nhật.</p></section><section class="panel explorer3d-card"><span class="tag">KHÔNG GIAN BA CHIỀU</span><h2>Mô hình Lorentz và ném xiên</h2><p>Xoay góc nhìn để phân biệt quỹ đạo xoắn ốc của hạt tích điện và quỹ đạo ném xiên trong trọng trường.</p><a class="button primary" href="#/explorer3d">Mở trình khám phá 3D ${icon('arrow')}</a></section><section class="panel" aria-labelledby="backup-tools-title"><span class="tag">DỮ LIỆU CÁ NHÂN</span><h2 id="backup-tools-title">Sao lưu và khôi phục tiến độ</h2><p>Thay vì hiển thị liên tục trên thanh đầu, các thao tác sao lưu được đặt tại đây để khu vực mô phỏng tập trung hơn. Dữ liệu vẫn chỉ lưu cục bộ trên trình duyệt hiện tại.</p><div class="action-row"><button class="button secondary" id="tools-export-progress" type="button">Xuất bản sao dữ liệu</button><button class="button secondary" id="tools-import-progress" type="button">Nhập dữ liệu đã lưu</button></div><p id="backup-tools-status" class="helper-text">Khuyến nghị xuất bản sao trước khi chuyển máy hoặc xóa dữ liệu trình duyệt.</p></section><section class="panel" aria-labelledby="teacher-tools-title"><span class="tag">CHẾ ĐỘ GIÁO VIÊN</span><h2 id="teacher-tools-title">Điều khiển lớp học nhanh</h2><p>Bật vai trò giáo viên, vào trình chiếu toàn màn hình và chia sẻ nhanh các tình huống khám phá từ một giao diện tập trung.</p><div class="action-row"><button class="button secondary" id="tools-role-toggle" type="button">Chuyển sang giáo viên</button><button class="button primary" id="tools-presentation-toggle" type="button">Bật trình chiếu</button></div><div class="teacher-note"><strong>Gợi ý dùng trên lớp</strong><ul><li>Chọn mô phỏng → đặt thông số mẫu → dùng nút “Trình chiếu”.</li><li>Sau bài học, dùng “Xuất bản sao dữ liệu” nếu muốn lưu toàn bộ tiến độ cục bộ.</li><li>Trình chiếu không cần tài khoản hay backend.</li></ul></div></section></div>`;

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
  main.querySelector('#tools-export-progress').addEventListener('click', () => {
    window.PhysicsLabApp?.exportProgressBackup?.();
    backupStatus.textContent = 'Đã tạo tệp JSON sao lưu tiến độ học tập trên thiết bị này.';
  });
  main.querySelector('#tools-import-progress').addEventListener('click', () => {
    window.PhysicsLabApp?.promptProgressImport?.();
    backupStatus.textContent = 'Chọn tệp JSON đã xuất trước đó để khôi phục tiến độ.';
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
  window.addEventListener('physicslab:rolechange', syncTeacherButtons);
  window.addEventListener('physicslab:presentationchange', syncTeacherButtons);
  syncTeacherButtons();
}
