package com.mediSync.project.medical.service;

import com.mediSync.project.medical.mapper.UserAccountMapper;

import com.mediSync.project.medical.vo.UserAccount;
import com.mediSync.project.patient.service.PatientService;
import com.mediSync.project.patient.vo.Patient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAccountService {

    private final UserAccountMapper userAccountMapper;
    private final PatientService patientService;

    public List<UserAccount> userSelectAll() {
        return userAccountMapper.selectAllUser();
    }
    public UserAccount userSelectOne(Long userId) {
        return userAccountMapper.selectUserById(userId);
    }
    public boolean isLoginIdAvailable(String loginId){
        int count = userAccountMapper.checkIdExists(loginId);
        return count == 0; // 0이면 사용 가능
    }

    @Transactional
    public int userInsert(UserAccount vo){
        int userResult = userAccountMapper.insertUser(vo);

        if (userResult > 0) {
            Patient patient = new Patient();
            // user_account의 정보를 patient에 매핑
            patient.setName(vo.getName());
            patient.setPhone(vo.getPhone());
            patient.setEmail(vo.getEmail());
            patient.setUserId(vo.getUserId());
            patient.setResidentNo("-");
            patient.setAddress("미입력");

            int patientResult = patientService.register(patient);

            if (patientResult == 0) {
                // patient 삽입 실패 시 롤백을 위해 RuntimeException 발생
                throw new RuntimeException("Patient 테이블 삽입 실패.");
            }
        }
        return userResult;
    }

    @Transactional
    public int userUpdate(UserAccount vo) {
        int userModify = userAccountMapper.updateUser(vo);

        if (userModify > 0) {
            if (vo.getPatient() != null) {
                Patient patient = vo.getPatient();
                patient.setUserId(vo.getUserId());
                patient.setName(vo.getName());
                patient.setPhone(vo.getPhone());
                patient.setEmail(vo.getEmail());

                patient.setResidentNo(vo.getPatient().getResidentNo());
                patient.setAddress(vo.getPatient().getAddress());
                patient.setAge(vo.getPatient().getAge());
                patient.setGender(vo.getPatient().getGender());
                //patient.setConsentInsurance(vo.getPatient().isConsentInsurance());

                int patientModify = patientService.updatePatient(patient);

                if (patientModify == 0) {
                    throw new RuntimeException("Patient 테이블 업데이트 실패.");
                }
            }
        }
        return userModify;
    }

    public int userDelete(Long userId) {
        return userAccountMapper.deleteUser(userId);
    }

    public UserAccount selectUserByLoginId(String loginId) {
        return userAccountMapper.selectUserByLoginId(loginId);
    }
    public UserAccount login(String loginId, String password) {
        UserAccount user = userAccountMapper.selectUserByLoginId(loginId);
            if (user == null) {
                return null;
            }
            if (user.getPassword().equals(password)) {
                return user;
            } else {
                return null;
        }
    }
    public String findLoginIdByNameAndPhone(String name, String phone) {
        return userAccountMapper.selectLoginIdByNameAndPhone(name, phone);
    }
    public  UserAccount findUserForSendEmail(String loginId, String name, String phone){
        return userAccountMapper.selectUserForSendEmail(loginId, name, phone);
    }
    public int resetPassword(String loginId, String encodedPassword) {
        return userAccountMapper.updatePasswordByUserInfo(loginId, encodedPassword);
    }
}
