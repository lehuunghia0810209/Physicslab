export const categories = [
  { id: 'all', title: 'Tất cả', icon: 'grid' },
  { id: 'mechanics', title: 'Cơ học', icon: 'orbit', grade: 10 },
  { id: 'waves', title: 'Dao động & Sóng', icon: 'wave', grade: 11 },
  { id: 'electricity', title: 'Điện học', icon: 'bolt', grade: 11 },
  { id: 'magnetism', title: 'Từ trường', icon: 'magnet', grade: 12 },
  { id: 'optics', title: 'Quang học', icon: 'sun', grade: 11 },
  { id: 'thermal', title: 'Nhiệt học', icon: 'heat', grade: 12 }
];
export const lessons = Object.freeze([
  {
    id: 'projectile-discovery', title: 'Khám phá chuyển động ném xiên', grade: 10, simulation: 'projectile-motion', category: 'mechanics',
    steps: ['Dự đoán', 'Thử nghiệm', 'Quan sát đồ thị', 'Kiểm tra hiểu biết'],
    prompt: 'Cùng vận tốc đầu và độ cao phóng bằng 0, góc nào cho tầm xa lớn nhất?',
    predictionOptions: [['a', '30°'], ['b', '45°'], ['c', '60°']],
    observation: 'Đồ thị x–t là đường thẳng; y–t là parabol. Tại đỉnh, vᵧ = 0 nhưng gia tốc vẫn hướng xuống với độ lớn g. Hai góc phụ nhau cho cùng tầm xa khi điểm phóng và điểm rơi cùng độ cao.',
    quizPrompt: 'Tại đỉnh quỹ đạo, điều nào đúng?',
    quizOptions: [['a', 'Cả vₓ và vᵧ đều bằng 0.'], ['b', 'vᵧ = 0, gia tốc vẫn là −g theo phương y.'], ['c', 'Gia tốc bằng 0 vì vật đổi hướng.']],
    predictionCorrect: 'b', correct: 'b', explanation: 'Trọng lực vẫn tác dụng ở đỉnh. Với cùng độ cao đầu và cuối, 45° cho tầm xa cực đại.'
  },
  {
    id: 'newton-discovery', title: 'Lực tổng và gia tốc', grade: 10, simulation: 'newton', category: 'mechanics',
    steps: ['Dự đoán', 'Thử nghiệm', 'Quan sát đồ thị', 'Kiểm tra hiểu biết'],
    prompt: 'Khi khối lượng không đổi, nếu lực tổng tăng gấp đôi thì gia tốc sẽ…',
    predictionOptions: [['a', 'Giảm một nửa'], ['b', 'Không đổi'], ['c', 'Tăng gấp đôi']],
    observation: 'Đồ thị vận tốc–thời gian có độ dốc bằng gia tốc. So sánh các khối lượng để thấy cùng lực tổng tạo gia tốc nhỏ hơn khi khối lượng lớn hơn.',
    quizPrompt: 'Với lực tổng không đổi, tăng khối lượng lên gấp đôi làm gia tốc thay đổi thế nào?',
    quizOptions: [['a', 'Giảm còn một nửa.'], ['b', 'Tăng gấp đôi.'], ['c', 'Không đổi.']],
    predictionCorrect: 'c', correct: 'a', explanation: 'Theo a = Fnet/m, khi giữ Fnet và tăng m gấp đôi, gia tốc giảm một nửa.'
  },
  {
    id: 'work-energy-discovery', title: 'Công và động năng', grade: 10, simulation: 'work-energy', category: 'mechanics',
    steps: ['Dự đoán', 'Thử nghiệm', 'Đối chiếu năng lượng', 'Kiểm tra hiểu biết'],
    prompt: 'Giữ lực và góc không đổi, tăng quãng đường lên gấp đôi thì công của lực kéo…',
    predictionOptions: [['a', 'Tăng gấp đôi'], ['b', 'Không đổi'], ['c', 'Giảm một nửa']],
    observation: 'Công của lực kéo là Fd cosθ. Công của ma sát âm; tổng công bằng độ biến thiên động năng khi mô hình chỉ xét công của các lực đã khai báo.',
    quizPrompt: 'Một vật ban đầu đứng yên nhận tổng công dương 50 J. Động năng của nó tăng bao nhiêu?',
    quizOptions: [['a', '25 J'], ['b', '50 J'], ['c', '100 J']],
    predictionCorrect: 'a', correct: 'b', explanation: 'Định lý công–động năng: Wnet = ΔEk. Động năng tăng 50 J.'
  },
  {
    id: 'collision-discovery', title: 'Động lượng trong va chạm', grade: 10, simulation: 'momentum-collision', category: 'mechanics',
    steps: ['Dự đoán', 'Thử nghiệm', 'So sánh trước–sau', 'Kiểm tra hiểu biết'],
    prompt: 'Trong hệ cô lập, sau va chạm mềm dính, đại lượng nào luôn được bảo toàn?',
    predictionOptions: [['a', 'Động lượng'], ['b', 'Động năng'], ['c', 'Vận tốc từng vật']],
    observation: 'Tổng động lượng của hệ kín không đổi. Động năng giảm trong va chạm không đàn hồi; e = 1 là trường hợp va chạm đàn hồi hoàn toàn.',
    quizPrompt: 'Va chạm mềm dính trong hệ cô lập có tính chất nào?',
    quizOptions: [['a', 'Bảo toàn động năng và động lượng.'], ['b', 'Không bảo toàn đại lượng nào.'], ['c', 'Bảo toàn động lượng nhưng động năng có thể giảm.']],
    predictionCorrect: 'a', correct: 'c', explanation: 'Lực va chạm là nội lực nên tổng động lượng bảo toàn; một phần động năng chuyển thành nhiệt, âm hoặc biến dạng.'
  },
  {
    id: 'spring-oscillation-discovery', title: 'Chu kỳ dao động lò xo', grade: 11, simulation: 'spring-oscillation', category: 'waves',
    steps: ['Dự đoán', 'Thử nghiệm', 'Đọc đồ thị', 'Kiểm tra hiểu biết'],
    prompt: 'Giữ khối lượng không đổi, tăng độ cứng lò xo thì chu kỳ dao động sẽ…',
    predictionOptions: [['a', 'Tăng'], ['b', 'Giảm'], ['c', 'Không đổi']],
    observation: 'Vị trí và vận tốc lệch pha một phần tư chu kỳ. Tổng động năng và thế năng đàn hồi không đổi trong mô hình không ma sát.',
    quizPrompt: 'Khi độ cứng k tăng gấp bốn lần, khối lượng giữ nguyên, chu kỳ T thay đổi thế nào?',
    quizOptions: [['a', 'Tăng gấp đôi.'], ['b', 'Không đổi.'], ['c', 'Giảm còn một nửa.']],
    predictionCorrect: 'b', correct: 'c', explanation: 'T = 2π√(m/k), nên tăng k gấp bốn làm chu kỳ giảm còn một nửa.'
  },
  {
    id: 'wave-discovery', title: 'Tốc độ truyền sóng', grade: 11, simulation: 'wave-on-string', category: 'waves',
    steps: ['Dự đoán', 'Thử nghiệm', 'Đọc đồ thị', 'Kiểm tra hiểu biết'],
    prompt: 'Giữ tần số không đổi, tăng bước sóng lên gấp đôi thì tốc độ truyền sóng…',
    predictionOptions: [['a', 'Giảm một nửa'], ['b', 'Không đổi'], ['c', 'Tăng gấp đôi']],
    observation: 'Tốc độ truyền sóng bằng c = fλ. Các điểm trên dây dao động quanh vị trí cân bằng; dạng sóng dịch chuyển theo thời gian.',
    quizPrompt: 'Một sóng có tần số 2 Hz và bước sóng 3 m. Tốc độ truyền sóng bằng bao nhiêu?',
    quizOptions: [['a', '1,5 m/s'], ['b', '6 m/s'], ['c', '5 m/s']],
    predictionCorrect: 'c', correct: 'b', explanation: 'c = fλ = 2 × 3 = 6 m/s.'
  },
  {
    id: 'ohm-discovery', title: 'Định luật Ohm', grade: 11, simulation: 'electric-circuits', category: 'electricity',
    steps: ['Dự đoán', 'Thử nghiệm', 'So sánh cách mắc', 'Kiểm tra hiểu biết'],
    prompt: 'Với điện trở không đổi, tăng hiệu điện thế đặt vào hai đầu điện trở thì dòng điện…',
    predictionOptions: [['a', 'Tăng tỉ lệ thuận'], ['b', 'Giảm'], ['c', 'Không đổi']],
    observation: 'Trong mạch nối tiếp, dòng điện qua các phần tử bằng nhau và điện trở tương đương cộng lại. Trong mạch song song, điện áp trên mỗi nhánh bằng nhau và dòng tổng bằng tổng dòng nhánh.',
    quizPrompt: 'Điện trở 6 Ω được đặt vào nguồn 12 V. Cường độ dòng điện là bao nhiêu?',
    quizOptions: [['a', '0,5 A'], ['b', '2 A'], ['c', '72 A']],
    predictionCorrect: 'a', correct: 'b', explanation: 'Theo định luật Ohm, I = U/R = 12/6 = 2 A.'
  },
  {
    id: 'electric-field-discovery', title: 'Chồng chất điện trường', grade: 11, simulation: 'electric-field', category: 'electricity',
    steps: ['Dự đoán', 'Thử nghiệm', 'Quan sát vector', 'Kiểm tra hiểu biết'],
    prompt: 'Tại trung điểm giữa hai điện tích dương bằng nhau, cường độ điện trường tổng hợp bằng bao nhiêu?',
    predictionOptions: [['a','Bằng 0'],['b','Lớn gấp đôi mỗi điện trường'],['c','Không xác định được']],
    observation: 'Điện trường là đại lượng vector nên phải cộng cả hướng. Tại trung điểm hai điện tích dương bằng nhau, E⃗ tổng bằng 0 vì các vector ngược chiều; điện thế tại đó vẫn dương. Khi thay một điện tích bằng điện tích âm, hai vector điện trường tại trung điểm cùng hướng từ dương sang âm.',
    quizPrompt: 'Giữa hai điện tích +q và −q có độ lớn bằng nhau, tại trung điểm điện trường tổng hướng thế nào?',
    quizOptions: [['a','Từ âm sang dương'],['b','Từ dương sang âm'],['c','Bằng 0']],
    predictionCorrect: 'a', correct: 'b', explanation: 'Tại trung điểm, hai vector điện trường cùng hướng từ +q đến −q nên cộng độ lớn. Điện thế bằng 0 vì hai thế vô hướng trái dấu.'
  },
  {
    id: 'lorentz-discovery', title: 'Quỹ đạo hạt tích điện trong từ trường', grade: 12, simulation: 'magnetic-field', category: 'magnetism',
    steps: ['Dự đoán', 'Thử nghiệm', 'Phân tích quỹ đạo', 'Kiểm tra hiểu biết'],
    prompt: 'Khi vận tốc vuông góc với từ trường đều, lực Lorentz lên hạt tích điện sẽ…',
    predictionOptions: [['a', 'Song song với vận tốc'], ['b', 'Vuông góc với vận tốc'], ['c', 'Bằng không']],
    observation: 'Độ lớn lực từ F = |q|vB sinθ. Với v ⟂ B, lực luôn vuông góc vận tốc nên đổi hướng chuyển động, không đổi tốc độ; quỹ đạo tròn nếu v∥ = 0.',
    quizPrompt: 'Một điện tích chuyển động song song với đường sức từ. Lực từ tác dụng lên nó là bao nhiêu?',
    quizOptions: [['a', '|q|vB'], ['b', '|q|vB/2'], ['c', '0']],
    predictionCorrect: 'b', correct: 'c', explanation: 'Góc θ = 0 nên F = |q|vB sin0 = 0.'
  },
  {
    id: 'lens-discovery', title: 'Ảnh qua thấu kính hội tụ', grade: 11, simulation: 'lens', category: 'optics',
    steps: ['Dự đoán', 'Thử nghiệm', 'Dựng tia sáng', 'Kiểm tra hiểu biết'],
    prompt: 'Vật đặt giữa thấu kính hội tụ và tiêu điểm cho ảnh…',
    predictionOptions: [['a', 'Ảo, cùng chiều và phóng đại'], ['b', 'Thật, ngược chiều'], ['c', 'Không tạo ảnh']],
    observation: 'Theo 1/f = 1/do + 1/di. Khi do < f, di âm và độ phóng đại dương: ảnh ảo, cùng chiều, lớn hơn vật; khi do = f, tia ló song song.',
    quizPrompt: 'Một vật cách thấu kính 0,3 m, tiêu cự 0,1 m. Ảnh cách thấu kính bao xa?',
    quizOptions: [['a', '0,05 m'], ['b', '0,15 m'], ['c', '0,30 m']],
    predictionCorrect: 'a', correct: 'b', explanation: '1/di = 1/0,1 − 1/0,3 = 20/3 m⁻¹, do đó di = 0,15 m.'
  },
  {
    id: 'ideal-gas-discovery', title: 'Định luật khí lí tưởng', grade: 12, simulation: 'ideal-gas', category: 'thermal',
    steps: ['Dự đoán', 'Thử nghiệm', 'Đối chiếu trạng thái', 'Kiểm tra hiểu biết'],
    prompt: 'Một lượng khí xác định được nung nóng ở thể tích không đổi. Áp suất sẽ…',
    predictionOptions: [['a', 'Tăng tỉ lệ với nhiệt độ tuyệt đối'], ['b', 'Giảm'], ['c', 'Không đổi']],
    observation: 'PV = nRT. Khi V và n không đổi, P/T không đổi. Ở quá trình đẳng tích, khí không sinh công nên nhiệt lượng bằng độ tăng nội năng.',
    quizPrompt: 'Nếu nhiệt độ tuyệt đối tăng gấp đôi ở thể tích không đổi, áp suất thay đổi thế nào?',
    quizOptions: [['a', 'Giảm còn một nửa'], ['b', 'Tăng gấp đôi'], ['c', 'Không đổi']],
    predictionCorrect: 'a', correct: 'b', explanation: 'Từ PV = nRT với V,n không đổi, P tỉ lệ thuận T.'
  },
  {
    id: 'friction-discovery', title: 'Ma sát nghỉ và ma sát trượt', grade: 10, simulation: 'friction', category: 'mechanics',
    steps: ['Dự đoán', 'Thử nghiệm', 'Quan sát lực ma sát', 'Kiểm tra hiểu biết'],
    prompt: 'Khi lực kéo một vật đang đứng yên tăng nhưng chưa vượt ngưỡng ma sát nghỉ, lực ma sát nghỉ…',
    predictionOptions: [['a', 'Tăng để cân bằng lực kéo'], ['b', 'Luôn bằng μₖN'], ['c', 'Bằng không']],
    observation: 'Ma sát nghỉ tự điều chỉnh để cân bằng lực tiếp tuyến cho đến giá trị cực đại μₛN. Khi vật trượt, ma sát động có độ lớn xấp xỉ μₖN và ngược hướng vận tốc tương đối.',
    quizPrompt: 'Vật 5 kg trên mặt phẳng ngang có μₛ = 0,4. Với g = 9,81 m/s² và lực kéo 10 N, vật chuyển động không?',
    quizOptions: [['a', 'Có, vì lực kéo dương'], ['b', 'Không, vì lực kéo nhỏ hơn μₛmg'], ['c', 'Có, vì ma sát nghỉ bằng μₖN']],
    predictionCorrect: 'a', correct: 'b', explanation: 'Ngưỡng ma sát nghỉ là μₛmg ≈ 19,62 N, lớn hơn lực kéo 10 N nên vật vẫn đứng yên.'
  },
  {
    id: 'hooke-discovery', title: 'Lực đàn hồi và định luật Hooke', grade: 10, simulation: 'lab', category: 'mechanics',
    steps: ['Dự đoán', 'Thử nghiệm', 'Đọc đồ thị lực–độ dãn', 'Kiểm tra hiểu biết'],
    prompt: 'Trong giới hạn đàn hồi, nếu lực kéo lò xo tăng gấp đôi thì độ dãn sẽ…',
    predictionOptions: [['a', 'Tăng gấp đôi'], ['b', 'Không đổi'], ['c', 'Giảm một nửa']],
    observation: 'Định luật Hooke có dạng F = kΔx. Khi dùng cùng một lò xo, đồ thị lực theo độ dãn là đường thẳng có độ dốc bằng độ cứng k; các số đọc còn phụ thuộc độ phân giải dụng cụ.',
    quizPrompt: 'Một lò xo có độ cứng 25 N/m chịu lực 5 N. Độ dãn cân bằng là bao nhiêu?',
    quizOptions: [['a', '125 m'], ['b', '0,2 m'], ['c', '1,25 m']],
    predictionCorrect: 'a', correct: 'b', explanation: 'Δx = F/k = 5/25 = 0,2 m. Hãy đối chiếu độ dãn đọc được với độ chia của thước.'
  },
  {
    id: 'wave-interference-discovery', title: 'Giao thoa và sóng dừng', grade: 11, simulation: 'wave-on-string', category: 'waves',
    steps: ['Dự đoán', 'Thử nghiệm', 'Tìm nút và bụng sóng', 'Kiểm tra hiểu biết'],
    prompt: 'Hai sóng cùng biên độ gặp nhau với độ lệch pha 180°. Li độ tổng tại điểm gặp sẽ…',
    predictionOptions: [['a', 'Bằng không do giao thoa triệt tiêu'], ['b', 'Gấp đôi biên độ'], ['c', 'Không đổi theo pha']],
    observation: 'Nguyên lý chồng chất cho li độ tổng bằng tổng li độ từng sóng. Hai sóng cùng tần số, cùng biên độ và ngược pha triệt tiêu; sóng dừng hình thành các nút cố định và bụng dao động với biên độ cực đại.',
    quizPrompt: 'Trong sóng dừng, khoảng cách giữa hai nút liên tiếp bằng bao nhiêu?',
    quizOptions: [['a', 'λ'], ['b', 'λ/4'], ['c', 'λ/2']],
    predictionCorrect: 'a', correct: 'c', explanation: 'Hai nút kề nhau cách nhau nửa bước sóng; từ một nút đến bụng gần nhất là λ/4.'
  },
  {
    id: 'circuit-topology-discovery', title: 'Mạch điện nối tiếp và song song', grade: 11, simulation: 'electric-circuits', category: 'electricity',
    steps: ['Dự đoán', 'Thử nghiệm', 'So sánh số đo nhánh', 'Kiểm tra hiểu biết'],
    prompt: 'Hai điện trở bằng nhau mắc song song. Điện trở tương đương so với một điện trở riêng sẽ…',
    predictionOptions: [['a', 'Gấp đôi'], ['b', 'Bằng một nửa'], ['c', 'Không đổi']],
    observation: 'Mạch nối tiếp có cùng dòng qua các điện trở và R tương đương bằng tổng. Mạch song song có cùng hiệu điện thế trên các nhánh, dòng tổng bằng tổng dòng nhánh và nghịch đảo điện trở tương đương bằng tổng các nghịch đảo.',
    quizPrompt: 'Hai điện trở 20 Ω và 40 Ω mắc song song có điện trở tương đương bao nhiêu?',
    quizOptions: [['a', '60 Ω'], ['b', '30 Ω'], ['c', '13,33 Ω']],
    predictionCorrect: 'b', correct: 'c', explanation: '1/Rtđ = 1/20 + 1/40 nên Rtđ = 40/3 ≈ 13,33 Ω.'
  },
  {
    id: 'induction-discovery', title: 'Cảm ứng điện từ và định luật Lenz', grade: 12, simulation: 'magnetic-field', category: 'magnetism',
    steps: ['Dự đoán', 'Thử nghiệm', 'Theo dõi suất điện động cảm ứng', 'Kiểm tra hiểu biết'],
    prompt: 'Từ thông qua một vòng dây không đổi theo thời gian. Suất điện động cảm ứng trong vòng dây là…',
    predictionOptions: [['a', 'Bằng không'], ['b', 'Cực đại'], ['c', 'Tỉ lệ với điện trở dây']],
    observation: 'Định luật Faraday cho ε = −dΦB/dt. Dấu trừ trong định luật Lenz biểu thị dòng cảm ứng chống lại sự biến thiên từ thông gây ra nó; không có biến thiên từ thông thì không có suất điện động cảm ứng.',
    quizPrompt: 'Nếu từ thông qua một vòng dây tăng đều, độ lớn suất điện động cảm ứng phụ thuộc trực tiếp vào đại lượng nào?',
    quizOptions: [['a', 'Tốc độ biến thiên từ thông'], ['b', 'Chỉ từ thông ban đầu'], ['c', 'Khối lượng vòng dây']],
    predictionCorrect: 'a', correct: 'a', explanation: '|ε| = |dΦB/dt| với một vòng dây. Chiều dòng điện được xác định để chống lại sự tăng từ thông.'
  }
]);

export const lesson = lessons[0];
