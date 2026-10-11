/** Concise hands-on prompts, matched to the actual model and gesture of every simulation. */
export const experimentGuides = Object.freeze({
  'projectile-motion': ['Kéo đầu vectơ phóng để đổi góc hoặc tốc độ ban đầu.', 'Giữ tốc độ, thử góc 30° và 60°. Đọc tầm xa và độ cao trên đồ thị.', 'Hai tầm xa có bằng nhau không khi điểm phóng và điểm rơi cùng độ cao?'],
  'newton': ['Kéo mũi tên lực; thử thay đổi khối lượng trong bảng điều khiển.', 'Quan sát gia tốc, vận tốc và thời gian trên cùng một mô phỏng.', 'Với lực tổng hợp không đổi, khối lượng tăng thì gia tốc thay đổi thế nào?'],
  'inclined-plane': ['Kéo góc nghiêng trên hình và thả cho vật chuyển động.', 'Xem khi nào vật đứng yên, khi nào bắt đầu trượt; kiểm tra phản lực và ma sát.', 'So sánh thành phần trọng lực dọc mặt phẳng với giới hạn ma sát nghỉ.'],
  friction: ['Thay đổi lực kéo và ma sát, thử kéo vật khi còn đứng yên.', 'Tìm ngưỡng lực vừa đủ để vật bắt đầu chuyển động.', 'Vì sao ma sát nghỉ có thể bằng lực kéo trước khi đạt cực đại?'],
  'work-energy': ['Kéo mũi tên lực, sau đó quan sát vật di chuyển trên đường.', 'Đọc đồng thời đồ thị công lực kéo, công ma sát và động năng.', 'Kiểm tra tổng công có bằng độ biến thiên động năng không.'],
  'momentum-collision': ['Điều chỉnh hai khối lượng, vận tốc và loại va chạm.', 'Tua qua thời điểm hai vật tiếp xúc; so sánh động lượng trước và sau.', 'Trong va chạm không đàn hồi, đại lượng nào bảo toàn và đại lượng nào giảm?'],
  'spring-oscillation': ['Kéo vật ra khỏi vị trí cân bằng, rồi phát dao động.', 'Quan sát vật qua hai biên và vị trí cân bằng; theo dõi năng lượng.', 'Tại vị trí nào vận tốc lớn nhất và thế năng đàn hồi nhỏ nhất?'],
  'wave-on-string': ['Kéo dây để thử biên độ, sau đó chọn sóng truyền hoặc sóng dừng.', 'Theo dõi nút sóng, bụng sóng và đầu dò.', 'Một điểm trên dây có đi theo sóng truyền đi hay chỉ dao động tại chỗ?'],
  'electric-circuits': ['Kéo linh kiện để đổi điện trở và chọn mạch nối tiếp/song song.', 'Quan sát dòng điện, điện áp và công suất ở từng nhánh.', 'Tổng dòng điện các nhánh bằng dòng tổng trong mạch song song như thế nào?'],
  'electric-field': ['Kéo điện tích dương/âm và đầu dò trên bản đồ điện trường.', 'Đọc hướng véc-tơ điện trường và điện thế tại điểm khảo sát.', 'Điểm nào điện trường triệt tiêu khi hai điện tích cùng độ lớn?'],
  'magnetic-field': ['Thay dấu điện tích và góc giữa vận tốc với từ trường.', 'Quan sát sự đổi chiều lực Lorentz và suất điện động cảm ứng.', 'Khi vận tốc song song với B, lực từ tác dụng lên hạt bằng bao nhiêu?'],
  lens: ['Kéo vật lại gần và ra xa thấu kính.', 'Quan sát tia sáng, vị trí và chiều cao ảnh ở hai phía tiêu điểm.', 'Vì sao khi vật nằm trong tiêu cự, ảnh trở thành ảnh ảo?'],
  'ideal-gas': ['Kéo piston và chọn quá trình đẳng nhiệt/đẳng áp/đẳng tích.', 'So sánh áp suất, thể tích và nhiệt độ khi trạng thái thay đổi.', 'Kiểm tra PV = nRT và quan hệ nhiệt – công – nội năng.']
});
export function guideForSimulation(id) { return experimentGuides[id] || null; }
