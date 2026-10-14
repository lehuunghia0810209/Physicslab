/** PhysicsLab 2.4: thematic map of GDPT 2018 (NOT textbook-specific lesson numbering).
 * `available` means a linked simulation/lab really exists, while `planned` means content is descriptive only.
 * Core school curriculum and elective chuyên đề are intentionally distinguished.
 */
export const THPT_SOURCE = Object.freeze({
  name: 'Văn bản hợp nhất Chương trình GDPT · Bộ GDĐT',
  url: 'https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1483/vbhn-ttu-322018-202021-132022-ttbgddt.pdf',
  note: 'Thông tư 32/2018 được hợp nhất với sửa đổi 20/2021 và 13/2022. Sắp xếp theo mạch kiến thức, không theo số bài của một bộ SGK; một số mô phỏng là học liệu mở rộng.'
});
const item=(grade,id,theme,title,objective,question,simulationId=null,labId=null,lessonId=null,note='',elective=false)=>Object.freeze({grade,id,theme,title,objective,question,simulationId,labId,lessonId,note,elective,status:simulationId||labId||id==='12-calorimetry'?'available':'planned'});
export const THPT_PROGRAM=Object.freeze([
 item(10,'10-intro','Mở đầu','Đối tượng, phương pháp nghiên cứu Vật lí','Nêu được vai trò của phép đo, sai số và thực nghiệm.','Phân biệt dự đoán và kết quả đo như thế nào?',null,null,'10-intro','Hoạt động thảo luận và quan sát thiết bị; chưa có mô phỏng chuyên dụng.'),
 item(10,'10-measure','Mở đầu','Phép đo và sai số','Phân biệt độ chia dụng cụ, độ không đảm bảo và kết quả đo.','Làm thế nào để ghi số đo có ý nghĩa?',null,'hooke-law','10-measure','Tái sử dụng thước và lực kế Hooke để luyện đọc độ chia.'),
 item(10,'10-speed','Động học','Độ dịch chuyển và tốc độ','Phân biệt quãng đường, độ dịch chuyển và tốc độ trung bình.','Tốc độ trung bình có phải độ lớn vận tốc trung bình?','projectile-motion','projectile-motion','10-speed','Sử dụng tọa độ và thời gian ném xiên làm ví dụ minh họa.'),
 item(10,'10-acceleration','Động học','Gia tốc và biến đổi vận tốc','Đo biến thiên vận tốc trên một khoảng thời gian.','Làm thế nào nhận biết chuyển động nhanh dần?','newton','newton-second-law','10-acceleration'),
 item(10,'10-freefall','Động học','Sự rơi tự do và ném ngang','Khảo sát thành phần chuyển động theo phương đứng.','Vận tốc ngang có làm thời gian rơi tăng không?','projectile-motion','projectile-motion','10-freefall','Chọn preset ném ngang để so sánh.'),
 item(10,'10-kinematics','Động học','Chuyển động thẳng và đồ thị','Đọc x–t, v–t; nhận biết vận tốc và gia tốc.','Độ dốc đồ thị vận tốc nói lên điều gì?','projectile-motion','projectile-motion','10-kinematics','Mô phỏng ném xiên dùng để minh họa hai thành phần chuyển động.'),
 item(10,'10-projectile','Động học','Chuyển động ném xiên','Khảo sát tầm xa, thời gian bay, các thành phần vận tốc.','Góc nào cho tầm xa lớn nhất khi cùng độ cao?','projectile-motion','projectile-motion','10-projectile'),
 item(10,'10-newton','Động lực học','Ba định luật Newton','Dùng lực tổng hợp và khối lượng xác định gia tốc.','Tăng khối lượng hai lần làm gia tốc thay đổi thế nào?','newton','newton-second-law','newton-discovery'),
 item(10,'10-forces','Động lực học','Tổng hợp và phân tích lực','Đọc vectơ lực và phân tích theo hai trục.','Lực tổng bằng không thì gia tốc ra sao?','newton','newton-second-law','10-forces'),
 item(10,'10-equilibrium','Động lực học','Điều kiện cân bằng của chất điểm','Kiểm tra tổng lực bằng không bằng lực kế.','Vật đứng yên chịu mấy lực?', 'newton','newton-second-law','10-equilibrium'),
 item(10,'10-friction','Động lực học','Lực ma sát và mặt phẳng nghiêng','So sánh ma sát nghỉ, trượt và góc dốc tới hạn.','Khi nào vật bắt đầu trượt?','friction','friction','10-friction'),
 item(10,'10-energy','Công, năng lượng, công suất','Công và định lí động năng','Kiểm chứng công tổng làm thay đổi động năng.','Ma sát sinh công âm trong trường hợp nào?','work-energy','work-energy','10-energy'),
 item(10,'10-power','Công, năng lượng, công suất','Công suất và tốc độ thực hiện công','Phân biệt công và công suất trong các quá trình.','Hai máy cùng thực hiện một công, máy nào có công suất lớn hơn?','work-energy','work-energy','10-power','Bàn hiện đo công và động năng, cần bổ sung đồng hồ công suất chuyên dụng.'),
 item(10,'10-kinetic','Công, năng lượng, công suất','Động năng, thế năng và cơ năng','Nhận biết các dạng năng lượng trong chuyển động.','Khi lực làm công dương, động năng thay đổi ra sao?','work-energy','work-energy','10-kinetic'),
 item(10,'10-momentum','Động lượng','Bảo toàn động lượng và va chạm','Phân biệt đại lượng bảo toàn trong va chạm đàn hồi, không đàn hồi.','Va chạm mềm có bảo toàn động năng?','momentum-collision','momentum-collision','10-momentum'),
 item(10,'10-circular','Chuyển động tròn','Chuyển động tròn đều','Xác định gia tốc hướng tâm, lực hướng tâm.','Vì sao tốc độ không đổi vẫn có gia tốc?',null,null,'10-circular','Chưa có mô phỏng tròn đều riêng.'),
 item(10,'10-deformation','Biến dạng vật rắn','Định luật Hooke và đàn hồi','Đo lực – độ dãn, xác định độ cứng và sai số dụng cụ.','Độ dãn phụ thuộc lực kéo ra sao?',null,'hooke-law','10-deformation'),
 item(11,'11-osc','Dao động','Dao động điều hòa','Khảo sát chu kì, li độ, vận tốc và chuyển hóa năng lượng.','Khi độ cứng tăng, chu kì giảm hay tăng?','spring-oscillation','spring-oscillation','spring-oscillation-discovery'),
 item(11,'11-osc-energy','Dao động','Năng lượng trong dao động điều hòa','So sánh động năng và thế năng của vật khi chuyển động.','Vật qua vị trí cân bằng thì động năng ra sao?','spring-oscillation','spring-oscillation',null),
 item(11,'11-damping','Dao động','Dao động tắt dần và cộng hưởng','Nhận biết vai trò của lực cản và cộng hưởng.','Ma sát làm biên độ dao động thay đổi thế nào?',null,'hooke-law',null,'Bàn lò xo Hooke có chuyển động tắt dần, không có mô hình cưỡng bức/cộng hưởng đầy đủ.'),
 item(11,'11-wave','Sóng','Sóng cơ và tốc độ truyền sóng','Dùng bước sóng và tần số xác định tốc độ truyền.','Các phần tử vật chất có đi theo sóng không?','wave-on-string','wave-speed','wave-discovery'),
 item(11,'11-wavelength','Sóng','Bước sóng, tần số, chu kì','Đo tần số và bước sóng để suy ra tốc độ truyền.','Tăng tần số nhưng giữ tốc độ sẽ làm λ thay đổi thế nào?','wave-on-string','wave-speed',null),
 item(11,'11-standing','Sóng','Sóng dừng và phản xạ','Quan sát nút, bụng và phản xạ tại biên.','Điểm nút có li độ bằng bao nhiêu?','wave-on-string','wave-interference',null,'Sóng dừng có mode riêng trong mô phỏng sóng trên dây.'),
 item(11,'11-interf','Sóng','Giao thoa và sóng dừng','Quan sát chồng chất hai sóng kết hợp và điểm triệt tiêu.','Pha ngược nhau cho tổng li độ như thế nào?','wave-on-string','wave-interference','wave-interference-discovery'),
 item(11,'11-field','Trường điện','Điện tích, điện trường, điện thế','Cộng vectơ điện trường của nhiều điện tích.','Tại trung điểm hai điện tích dương bằng nhau, E bằng bao nhiêu?','electric-field',null,'electric-field-discovery'),
 item(11,'11-potential','Trường điện','Điện thế và hiệu điện thế','So sánh tính chất vô hướng của điện thế với vectơ điện trường.','Tại trung điểm hai điện tích trái dấu bằng nhau điện thế là bao nhiêu?','electric-field',null,null),
 item(11,'11-capacitor','Trường điện','Tụ điện và điện dung','Nhận biết điện dung và năng lượng tích trữ trong tụ điện.','Điện dung phụ thuộc cấu tạo thế nào?',null,null,null,'Chưa có phòng thí nghiệm tụ điện.'),
 item(11,'11-current','Dòng điện, mạch điện','Dòng điện, định luật Ohm','Lắp mạch, đọc ampe kế và vôn kế; so sánh hai kiểu mắc.','Đổi điện trở thì dòng điện thay đổi thế nào?','electric-circuits','ohms-law','ohm-discovery'),
 item(11,'11-electric-power','Dòng điện, mạch điện','Năng lượng và công suất điện','Dùng U và I để xác định công suất tiêu thụ.','Điện trở lớn hơn có luôn tỏa nhiệt nhiều hơn?','electric-circuits','ohms-law',null),
 item(11,'11-source','Dòng điện, mạch điện','Nguồn điện và điện trở trong','Giải thích suất điện động và điện trở trong của nguồn.','Vì sao điện áp hai cực giảm khi tải tăng?',null,null,null,'Bộ giải mạch hiện dùng nguồn lí tưởng; cần mô hình nguồn có điện trở trong riêng.'),
 item(11,'11-circuit','Dòng điện, mạch điện','Mạch nối tiếp, song song và định luật Kirchhoff','Kiểm tra điện áp và dòng điện bằng các dụng cụ mắc đúng.','Nếu tháo một nhánh song song, các nhánh khác còn sáng?','electric-circuits','ohms-law','circuit-topology-discovery'),
 item(11,'11-lens-extension','Học liệu mở rộng','Ảnh qua thấu kính hội tụ','Quan sát ảnh thật, ảnh ảo và dựng tia qua thấu kính.','Vật bên trong tiêu điểm cho ảnh thế nào?','lens','thin-lens','lens-discovery','Học liệu mở rộng: quang học không phải mạch nội dung chính của Vật lí 11 GDPT 2018.'),
 item(11,'11-gravity-elective','Chuyên đề tự chọn','Trường hấp dẫn','Khảo sát mô hình trường hấp dẫn và lực hấp dẫn.','Các vật tương tác qua trường hấp dẫn thế nào?',null,null,null,'Chuyên đề Vật lí 11; chưa triển khai.',true),
 item(12,'12-thermal','Vật lí nhiệt','Nội năng và nguyên lí I nhiệt động lực học','Phân biệt công, nhiệt và biến thiên nội năng.','Vật nhận nhiệt có nhất thiết tăng nhiệt độ?','ideal-gas','gas-law','ideal-gas-discovery','Thí nghiệm khí lí tưởng là mô hình liên quan; trạm nhiệt lượng riêng được bổ sung ở phòng thực hành nâng cao.'),
 item(12,'12-temperature','Vật lí nhiệt','Thang nhiệt độ và nhiệt kế','Đổi giữa thang Celsius và Kelvin; đọc nhiệt kế.','0 °C có bằng 0 K không?',null,null,null,'Có thể quan sát nhiệt kế trong trạm cân bằng nhiệt nâng cao.'),
 item(12,'12-phase','Vật lí nhiệt','Chuyển thể và nhiệt nóng chảy','Phân biệt biến thiên nhiệt độ và nhiệt chuyển thể.','Khi nóng chảy, nhiệt độ có tăng liên tục không?',null,null,null,'Chưa có mô hình định lượng chuyển pha.'),
 item(12,'12-specific-heat','Vật lí nhiệt','Nhiệt dung riêng','Đo nhiệt lượng khi thay đổi khối lượng và nhiệt độ.','Hai chất có c khác nhau cần cùng lượng nhiệt không?',null,null,null,'Dùng trạm cân bằng nhiệt chuyên sâu để khảo sát với c cố định theo vật liệu.'),
 item(12,'12-calorimetry','Vật lí nhiệt','Truyền nhiệt và cân bằng nhiệt','Tính nhiệt độ cân bằng từ bảo toàn năng lượng trong hệ cách nhiệt.','Pha hai lượng nước khác nhiệt độ, nhiệt độ cuối là bao nhiêu?',null,null,null,'Mở trạm thực hành nhiệt lượng chuyên sâu từ trang Thí nghiệm.'),
 item(12,'12-gas','Khí lí tưởng','Định luật khí và quá trình biến đổi trạng thái','Khảo sát p, V, T trên các quá trình đẳng nhiệt, đẳng tích.','Giữ thể tích không đổi, tăng nhiệt độ tuyệt đối thì p ra sao?','ideal-gas','gas-law','ideal-gas-discovery'),
 item(12,'12-isothermal','Khí lí tưởng','Định luật Boyle – quá trình đẳng nhiệt','Khảo sát p nghịch biến V ở T không đổi.','Nén đẳng nhiệt thể tích còn một nửa, p thay đổi thế nào?','ideal-gas','gas-law',null),
 item(12,'12-isochoric','Khí lí tưởng','Quá trình đẳng tích và đẳng áp','Khảo sát p/T và V/T cho lượng khí xác định.','Đẳng tích: khi T tăng 2 lần thì p ra sao?','ideal-gas','gas-law',null),
 item(12,'12-magnet','Trường từ','Từ trường và lực Lorentz','Xác định phương chiều lực từ; khảo sát chuyển động của điện tích.','Vận tốc song song B có lực từ không?','magnetic-field','lorentz-force','lorentz-discovery'),
 item(12,'12-induction','Trường từ','Cảm ứng điện từ và định luật Faraday–Lenz','Thay đổi từ thông qua cuộn dây và đo suất điện động.','Giữ nam châm đứng yên thì suất điện động là bao nhiêu?','magnetic-field','electromagnetic-induction','induction-discovery','Thí nghiệm chuyên sâu dùng nam châm tịnh tiến với mô hình từ thông hiệu dụng.'),
 item(12,'12-magnetic-force','Trường từ','Lực từ và dòng điện trong từ trường','Nhận biết lực từ tác dụng lên dây dẫn có dòng điện.','Chiều lực từ phụ thuộc chiều dòng điện ra sao?',null,null,null,'Mô phỏng Lorentz hiện minh họa cho hạt tích điện, chưa phải dây dẫn.'),
 item(12,'12-atom','Vật lí hạt nhân và phóng xạ','Cấu tạo và năng lượng liên kết hạt nhân','Nêu được cấu tạo hạt nhân và ý nghĩa năng lượng liên kết.','Vì sao khối lượng hạt nhân nhỏ hơn tổng khối lượng nucleon?',null,null,null,'Chưa có mô hình hạt nhân.'),
 item(12,'12-half-life','Vật lí hạt nhân và phóng xạ','Chu kì bán rã','Mô tả phân rã ngẫu nhiên và quy luật giảm theo thời gian.','Sau hai chu kì bán rã còn bao nhiêu phần chưa phân rã?',null,null,null,'Chưa có mô phỏng bán rã.'),
 item(12,'12-nuclear','Vật lí hạt nhân và phóng xạ','Hạt nhân, phóng xạ và an toàn bức xạ','Nhận biết phóng xạ, thời gian bán rã và các lưu ý an toàn.','Số hạt chưa phân rã giảm ra sao theo thời gian?',null,null,null,'Chưa có mô phỏng định lượng hạt nhân.'),
 item(12,'12-ac-elective','Chuyên đề tự chọn','Dòng điện xoay chiều','Nêu đặc điểm tín hiệu xoay chiều và ứng dụng.','Giá trị hiệu dụng khác cực đại thế nào?',null,null,null,'Chuyên đề Vật lí 12; chưa có thiết bị AC chuyên dụng.',true),
 item(12,'12-quantum-elective','Chuyên đề tự chọn','Vật lí lượng tử','Nhận biết giới hạn của mô hình cổ điển.','Ánh sáng thể hiện tính hạt trong hiện tượng nào?',null,null,null,'Chuyên đề Vật lí 12; chưa triển khai.',true)
]);
export const THPT_GRADES=Object.freeze([10,11,12]);
export function programForGrade(grade,{includeElectives=true}={}){return THPT_PROGRAM.filter(x=>x.grade===Number(grade)&&(includeElectives||!x.elective));}
const LAB_ALIASES=Object.freeze({'hooke-first':'hooke-law','circuit-first':'ohms-law','gas-first':'gas-law',hooke:'hooke-law',gas:'gas-law'});
export function labGrades(id){
 const target=LAB_ALIASES[id]||id;
 const grades=[...new Set(THPT_PROGRAM.filter(item=>item.labId===target).map(item=>item.grade))];
 if(grades.length)return grades.sort();
 if(['newton-second-law','friction','work-energy','momentum-collision','inclined-plane','projectile-motion'].includes(target))return [10];
 if(['wave-speed','wave-interference','spring-oscillation','thin-lens'].includes(target))return [11];
 return [12];
}
export function labGrade(id){return labGrades(id)[0];}
export function programForLab(id){return THPT_PROGRAM.filter(x=>x.labId===id);}
