-- ===========================================
-- 1. 환자 / 의사 / 진료 관련
-- ===========================================
select * from patient;
CREATE TABLE patient ( -- 환자 정보(의료)
    patient_id       BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '환자 고유번호 (PK)',
    name             VARCHAR(50) NOT NULL COMMENT '환자 이름',
    resident_no      VARCHAR(20) UNIQUE COMMENT '주민등록번호 (고유식별)',
    phone            VARCHAR(20) NOT NULL COMMENT '연락처',
    address          VARCHAR(200) COMMENT '주소',
    insurer_code     VARCHAR(20) COMMENT '보험사 코드 (FK: insurer.insurer_code)',
    consent_insurance TINYINT(1) DEFAULT 0 COMMENT '보험자동청구 동의 여부 (0: 미동의, 1: 동의)',
    status           ENUM('ACTIVE','DISABLED') DEFAULT 'ACTIVE' COMMENT '환자 상태 (활성/비활성)',
    created_at       DATETIME DEFAULT NOW() COMMENT '등록일시',
    updated_at       DATETIME DEFAULT NOW() ON UPDATE NOW() COMMENT '수정일시',
    email VARCHAR(200) COMMENT '이메일 주소'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='환자 기본 정보 테이블';

CREATE TABLE doctor (
    doctor_id    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '의사 고유번호 (PK)',
    name         VARCHAR(50) NOT NULL COMMENT '의사 이름',
    department   VARCHAR(50) COMMENT '진료과명',
    license_no   VARCHAR(30) COMMENT '면허번호',
    phone        VARCHAR(20) COMMENT '연락처',
    created_at   DATETIME DEFAULT NOW() COMMENT '등록일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='의사 기본 정보 테이블';

CREATE TABLE medical_staff (
    staff_id     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '의료진 고유번호 (PK)',
    name         VARCHAR(50) NOT NULL COMMENT '의료진 이름',
    position     ENUM('NURSE','RADIOLOGIST','LAB_TECH','ASSISTANT','ADMIN') COMMENT '직무 유형',
    department   VARCHAR(50) COMMENT '소속 진료과',
    license_no   VARCHAR(30) COMMENT '자격번호 (간호사면허 등)',
    phone        VARCHAR(20) COMMENT '연락처',
    status       ENUM('ACTIVE','LEAVE','RETIRED') DEFAULT 'ACTIVE' COMMENT '재직 상태',
    hired_date   DATE COMMENT '입사일',
    created_at   DATETIME DEFAULT NOW() COMMENT '등록일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='의료진(간호사, 방사선사 등) 관리 테이블';

CREATE TABLE department (
    dept_id    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '진료과 ID',
    dept_name  VARCHAR(100) NOT NULL COMMENT '진료과 명칭',
    description VARCHAR(255) COMMENT '설명',
    created_at DATETIME DEFAULT NOW() COMMENT '등록일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='진료과 관리 테이블';

CREATE TABLE reservation (
    reservation_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '진료 예약 ID',
    patient_id     BIGINT NOT NULL COMMENT '환자 ID (FK: patient)',
    doctor_id      BIGINT NOT NULL COMMENT '의사 ID (FK: doctor)',
    reservation_date DATETIME NOT NULL COMMENT '예약 일시',
    status         ENUM('WAIT','CONSULT','DONE','CANCEL') DEFAULT 'WAIT' COMMENT '예약 상태',
    created_at     DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='진료 예약 관리 테이블';

CREATE TABLE operation (
    operation_id  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '수술 ID',
    patient_id    BIGINT NOT NULL COMMENT '환자 ID (FK)',
    doctor_id     BIGINT NOT NULL COMMENT '집도의 ID (FK)',
    staff_id      BIGINT COMMENT '보조 의료진 (FK)',
    operation_name VARCHAR(100) COMMENT '수술명',
    scheduled_at  DATETIME COMMENT '수술 예정일',
    status        ENUM('SCHEDULED','IN_PROGRESS','DONE','CANCELLED') DEFAULT 'SCHEDULED' COMMENT '진행상태',
    room_no       VARCHAR(20) COMMENT '수술실 번호',
    cost          DECIMAL(10,2) COMMENT '수술비용',
    created_at    DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (staff_id) REFERENCES medical_staff(staff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='수술 일정 및 내역 테이블';

CREATE TABLE medical_record (
    record_id    BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '진료기록 ID',
    patient_id   BIGINT NOT NULL COMMENT '환자 ID (FK: patient)',
    doctor_id    BIGINT NOT NULL COMMENT '의사 ID (FK: doctor)',
    diagnosis    VARCHAR(200) NOT NULL COMMENT '진단명',
    total_cost   DECIMAL(10,2) COMMENT '진료 총비용',
    status       ENUM('WAIT','CONSULT','DONE','BILLING') DEFAULT 'WAIT' COMMENT '진료 상태',
    created_at   DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='진료 기록 테이블';

CREATE TABLE prescription (
    prescription_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '처방 ID',
    record_id       BIGINT NOT NULL COMMENT '진료기록 ID (FK: medical_record)',
    drug_name       VARCHAR(100) COMMENT '약품명 / 검사명',
    dosage          VARCHAR(50) COMMENT '복용량 / 검사량',
    duration        VARCHAR(50) COMMENT '복용기간 / 검사주기',
    type            ENUM('DRUG','TEST','INJECTION') COMMENT '처방 유형',
    created_at      DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (record_id) REFERENCES medical_record(record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='약품 및 검사 처방 테이블';

CREATE TABLE document (
    document_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '서류 ID',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK: patient)',
    doc_type    ENUM('CONSENT','RECORD','PRESCRIPTION') COMMENT '문서 유형',
    file_path   VARCHAR(255) COMMENT '파일 경로',
    uploaded_at DATETIME DEFAULT NOW() COMMENT '업로드 일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='진료 기록지 및 동의서 파일 저장 테이블';

-- ===========================================
-- 2. 수납 / 결제 관련
-- ===========================================

CREATE TABLE billing (
    bill_id       BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '수납 ID',
    record_id     BIGINT NOT NULL COMMENT '진료기록 ID (FK)',
    total_amount  DECIMAL(10,2) COMMENT '총 진료비',
    discount      DECIMAL(10,2) DEFAULT 0 COMMENT '할인 금액',
    status        ENUM('WAIT','PAID') DEFAULT 'WAIT' COMMENT '수납 상태',
    created_at    DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (record_id) REFERENCES medical_record(record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='수납 정보 테이블';

CREATE TABLE payment (
    payment_id  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '결제 ID',
    bill_id     BIGINT NOT NULL COMMENT '수납 ID (FK)',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK)',
    amount      DECIMAL(10,2) COMMENT '결제 금액',
    method      ENUM('CARD','CASH','TRANSFER') COMMENT '결제 수단',
    status      ENUM('SUCCESS','CANCEL') DEFAULT 'SUCCESS' COMMENT '결제 상태',
    created_at  DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id),
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='결제 정보 테이블';

CREATE TABLE not_paid (
    notpaid_id  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '미수금 ID',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK)',
    reason      VARCHAR(255) COMMENT '미수금 사유',
    expected_date DATE COMMENT '예정 수납일',
    amount      DECIMAL(10,2) DEFAULT 0 COMMENT '미수금 금액',
    created_at  DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='미수금 관리 테이블';

CREATE TABLE deposit (
    deposit_id  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '예치금 ID',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK)',
    amount      DECIMAL(10,2) DEFAULT 0 COMMENT '예치금 금액',
    payment_type ENUM('CASH','CARD','TRANSFER') COMMENT '입금 방식',
    reason      VARCHAR(100) COMMENT '입금 사유',
    created_at  DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='선수금 / 예치금 관리 테이블';

CREATE TABLE receipt (
    receipt_id  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '영수증 ID',
    payment_id  BIGINT NOT NULL COMMENT '결제 ID (FK)',
    file_path   VARCHAR(255) COMMENT '영수증 파일 경로',
    issued_at   DATETIME DEFAULT NOW() COMMENT '발행일시',
    FOREIGN KEY (payment_id) REFERENCES payment(payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='영수증 발행 테이블';

CREATE TABLE tax_invoice (
    invoice_id  BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '세금계산서 ID',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK)',
    total_amount DECIMAL(10,2) COMMENT '총금액',
    pdf_path    VARCHAR(255) COMMENT 'PDF 파일 경로',
    issued_at   DATETIME DEFAULT NOW() COMMENT '발행일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='세금계산서 / 현금영수증 발행 테이블';

-- ===========================================
-- 3. 보험청구 관련(*맨 마지막에 건들기*)
-- ===========================================

CREATE TABLE insurer (
    insurer_code VARCHAR(20) PRIMARY KEY COMMENT '보험사 코드 (PK)',
    name         VARCHAR(100) NOT NULL COMMENT '보험사 명칭',
    api_endpoint VARCHAR(255) COMMENT '보험사 연동 API URL',
    contact      VARCHAR(100) COMMENT '담당자 연락처'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='보험사 정보 테이블';

CREATE TABLE claim_request (
    claim_id     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '보험청구 ID',
    record_id    BIGINT NOT NULL COMMENT '진료기록 ID (FK)',
    insurer_code VARCHAR(20) COMMENT '보험사 코드 (FK)',
    claim_amount DECIMAL(10,2) COMMENT '청구 금액',
    status       ENUM('SENT','APPROVED','REJECTED','RETRY') DEFAULT 'SENT' COMMENT '청구 상태',
    auto_generated TINYINT(1) DEFAULT 1 COMMENT '자동청구 여부 (1: 자동)',
    created_at   DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (record_id) REFERENCES medical_record(record_id),
    FOREIGN KEY (insurer_code) REFERENCES insurer(insurer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='보험 청구 요청 테이블';

CREATE TABLE claim_response (
    claim_id     BIGINT PRIMARY KEY COMMENT '보험청구 ID (FK)',
    paid_amount  DECIMAL(10,2) COMMENT '보험사 승인 금액',
    result_code  ENUM('SUCCESS','FAIL') COMMENT '응답 결과코드',
    paid_date    DATETIME COMMENT '지급일자',
    message      VARCHAR(255) COMMENT '보험사 응답 메시지',
    FOREIGN KEY (claim_id) REFERENCES claim_request(claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='보험사 응답 결과 테이블';

CREATE TABLE claim_log (
    log_id      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '청구 로그 ID',
    claim_id    BIGINT NOT NULL COMMENT '보험청구 ID (FK)',
    status      VARCHAR(30) COMMENT '상태값',
    message     VARCHAR(255) COMMENT '로그 메시지',
    logged_at   DATETIME DEFAULT NOW() COMMENT '기록 시각',
    FOREIGN KEY (claim_id) REFERENCES claim_request(claim_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='보험청구 상태 로그 테이블';

-- ===========================================
-- 4. 회계 / 예산 / 세금
-- ===========================================

CREATE TABLE finance_transaction (
    tx_id       BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '거래 ID',
    ref_type    ENUM('PAYMENT','CLAIM','EXPENSE') COMMENT '참조 유형',
    ref_id      BIGINT COMMENT '참조 PK ID',
    type        ENUM('INCOME','EXPENSE') COMMENT '거래 구분',
    amount      DECIMAL(10,2) COMMENT '거래 금액',
    created_at  DATETIME DEFAULT NOW() COMMENT '등록일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회계 거래 내역 테이블';

CREATE TABLE budget_plan (
    budget_id      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '예산 계획 ID',
    dept_name      VARCHAR(50) COMMENT '부서명',
    month          CHAR(7) COMMENT '대상 월 (YYYY-MM)',
    planned_budget DECIMAL(10,2) COMMENT '예산 금액',
    actual_expense DECIMAL(10,2) DEFAULT 0 COMMENT '실제 지출 금액'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='부서별 예산 관리 테이블';

CREATE TABLE tax (
    tax_id     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '세금 ID',
    tx_id      BIGINT COMMENT '거래 ID (FK)',
    rate       DECIMAL(5,2) DEFAULT 10.00 COMMENT '세율(%)',
    tax_amount DECIMAL(10,2) COMMENT '세금 금액',
    created_at DATETIME DEFAULT NOW() COMMENT '등록일시',
    FOREIGN KEY (tx_id) REFERENCES finance_transaction(tx_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='세금 기록 테이블';

-- ===========================================
-- 5. 재고 / 유통
-- ===========================================

CREATE TABLE inventory_item (
    item_id     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '재고 ID',
    item_name   VARCHAR(100) COMMENT '품명',
    unit        VARCHAR(20) COMMENT '단위',
    quantity    INT DEFAULT 0 COMMENT '수량',
    price       DECIMAL(10,2) COMMENT '단가',
    supplier    VARCHAR(100) COMMENT '구매처',
    expiry_date DATE COMMENT '유효기간',
    location    VARCHAR(50) COMMENT '보관 위치',
    min_stock   INT DEFAULT 5 COMMENT '최소 재고 임계값',
    updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW() COMMENT '갱신일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='의약품 및 소모품 재고 테이블';

CREATE TABLE device (
    device_id   BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '장비 ID',
    device_name VARCHAR(100) COMMENT '장비명',
    status      ENUM('IN_USE','STORED','REPAIR') DEFAULT 'STORED' COMMENT '상태값',
    location    VARCHAR(50) COMMENT '위치',
    purchase_date DATE COMMENT '구매일자',
    price       DECIMAL(10,2) COMMENT '금액'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='의료기기 및 병원 장비 관리 테이블';

-- ===========================================
-- 6. 사용자 포털 / 문진 / 알림
-- ===========================================

CREATE TABLE user_account (
    user_id     BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    login_id    VARCHAR(255) COMMENT '아이디 (로그인용)',
    password    VARCHAR(255) COMMENT '비밀번호 (암호화)',
    name        VARCHAR(50) COMMENT '이름',
    phone       VARCHAR(20) COMMENT '연락처',
    role        ENUM('USER','ADMIN') DEFAULT 'USER' COMMENT '권한 구분',
    created_at  DATETIME DEFAULT NOW() COMMENT '등록일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원가입 및 로그인 사용자 계정 테이블';

CREATE TABLE admin_account (
    admin_id      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '어드민 ID',
    emp_id        VARCHAR(50) UNIQUE NOT NULL COMMENT '사번 (로그인용)',
    password      VARCHAR(255) NOT NULL COMMENT '비밀번호 (암호화)',
    name          VARCHAR(50) NOT NULL COMMENT '이름',
    phone         VARCHAR(20) COMMENT '연락처',
    email         VARCHAR(100) UNIQUE COMMENT '이메일',
    role          ENUM('USER','ADMIN') DEFAULT 'ADMIN' COMMENT '권한 구분',
    -- 프로필 이미지 URL 또는 파일 경로
    profile_img_url VARCHAR(255) COMMENT '업로드된 프로필 이미지 파일 경로/URL',
    -- doctor 테이블 연동
    doctor_id     BIGINT UNIQUE COMMENT '연동된 의사 ID (FK)',
    -- medical_staff 테이블 연동
    staff_id      BIGINT UNIQUE COMMENT '연동된 의료진 ID (FK)',
    created_at    DATETIME DEFAULT NOW() COMMENT '등록일시',

    -- 외래 키 제약 조건 설정
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE SET NULL,
    FOREIGN KEY (staff_id) REFERENCES medical_staff(staff_id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원가입 및 로그인 직원 계정 테이블';

CREATE TABLE question (
    question_id   BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '문진 문항 ID',
    question_text VARCHAR(255) COMMENT '질문 내용',
    input_type    ENUM('CHECKBOX','RADIO','TEXT') COMMENT '입력 유형'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='문진 질문 항목 테이블';

CREATE TABLE patient_response (
    response_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '문진 응답 ID',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK)',
    question_id BIGINT NOT NULL COMMENT '문항 ID (FK)',
    answer_text VARCHAR(255) COMMENT '응답 내용',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (question_id) REFERENCES question(question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='환자별 문진 응답 결과 테이블';

CREATE TABLE notification (
    noti_id      BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '알림 ID',
    patient_id   BIGINT NOT NULL COMMENT '환자 ID (FK)',
    title        VARCHAR(100) COMMENT '알림 제목',
    message      VARCHAR(255) COMMENT '알림 내용',
    read_status  TINYINT(1) DEFAULT 0 COMMENT '읽음 상태 (0: 미확인, 1: 확인)',
    created_at   DATETIME DEFAULT NOW() COMMENT '발송 시각',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='실시간 알림 관리 테이블';

CREATE TABLE review (
    review_id   BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '후기 ID',
    patient_id  BIGINT NOT NULL COMMENT '환자 ID (FK)',
    doctor_id   BIGINT COMMENT '의사 ID (FK)',
    record_id   BIGINT COMMENT '진료기록 ID (FK)',
    rating      INT CHECK (rating BETWEEN 1 AND 5) COMMENT '평점 (1~5)',
    comment     VARCHAR(500) COMMENT '리뷰 내용',
    created_at  DATETIME DEFAULT NOW() COMMENT '작성일시',
    FOREIGN KEY (patient_id) REFERENCES patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id),
    FOREIGN KEY (record_id) REFERENCES medical_record(record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='환자 후기 및 만족도 관리 테이블';

CREATE TABLE chat_message (
    message_id   BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '메시지 ID',
    sender_id    BIGINT NOT NULL COMMENT '보낸 사용자 (FK: user_account.user_id)',
    receiver_id  BIGINT NOT NULL COMMENT '받는 사용자 (FK: user_account.user_id)',
    content      TEXT COMMENT '메시지 내용',
    sent_at      DATETIME DEFAULT NOW() COMMENT '전송 시각',
    read_status  TINYINT(1) DEFAULT 0 COMMENT '읽음 여부',
    chat_type    ENUM('CONSULT','RESERVATION','BILLING','GENERAL') DEFAULT 'GENERAL' COMMENT '채팅 유형',
    FOREIGN KEY (sender_id) REFERENCES user_account(user_id),
    FOREIGN KEY (receiver_id) REFERENCES user_account(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='실시간 상담 / 채팅 로그 테이블';

