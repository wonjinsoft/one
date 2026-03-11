document.addEventListener('DOMContentLoaded', () => {
    const sectionRegister = document.getElementById('section-register');
    const sectionList = document.getElementById('section-list');
    const menuRegister = document.getElementById('menu-register');
    const menuList = document.getElementById('menu-list');
    const formRegister = document.getElementById('form-register');
    const tbodyList = document.getElementById('tbody-list');
    const emptyMsg = document.getElementById('empty-msg');
    const tableList = document.getElementById('table-list');

    const API_URL = '/api/facilities';

    // 메뉴 클릭 이벤트: 등록 화면 전환
    menuRegister.addEventListener('click', (e) => {
        e.preventDefault();
        sectionRegister.style.display = 'block';
        sectionList.style.display = 'none';
    });

    // 메뉴 클릭 이벤트: 목록 화면 전환 및 데이터 로드
    menuList.addEventListener('click', (e) => {
        e.preventDefault();
        sectionRegister.style.display = 'none';
        sectionList.style.display = 'block';
        loadFacilities();
    });

    // 설비 정보 등록 (POST)
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formRegister);
        const data = {
            name: formData.get('name'),
            type: formData.get('type'),
            location: formData.get('location'),
            manager: formData.get('manager')
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('설비 정보가 성공적으로 등록되었습니다.');
                formRegister.reset();
            } else {
                alert('등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버 연결 오류가 발생했습니다.');
        }
    });

    // 설비 목록 로드 (GET)
    async function loadFacilities() {
        try {
            const response = await fetch(API_URL);
            const facilities = await response.json();

            tbodyList.innerHTML = '';
            
            if (facilities.length === 0) {
                tableList.style.display = 'none';
                emptyMsg.style.display = 'block';
            } else {
                tableList.style.display = 'table';
                emptyMsg.style.display = 'none';
                
                facilities.forEach(fac => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${fac.name}</td>
                        <td>${fac.type}</td>
                        <td>${fac.location}</td>
                        <td>${fac.manager}</td>
                    `;
                    tbodyList.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다.');
        }
    }
});
