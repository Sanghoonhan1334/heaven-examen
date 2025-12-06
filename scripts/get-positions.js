// 로컬 브라우저의 localStorage에서 위치 값 확인 스크립트
// 브라우저 콘솔에서 실행하세요

console.log('=== 천국 성 위치 ===');
console.log('Desktop:', JSON.parse(localStorage.getItem('heavenGatePositionDesktop') || 'null'));
console.log('Tablet:', JSON.parse(localStorage.getItem('heavenGatePositionTablet') || 'null'));
console.log('Mobile:', JSON.parse(localStorage.getItem('heavenGatePositionMobile') || 'null'));

console.log('\n=== 캐릭터 위치 ===');
console.log('Desktop:', JSON.parse(localStorage.getItem('characterPositionsDesktop') || 'null'));
console.log('Tablet:', JSON.parse(localStorage.getItem('characterPositionsTablet') || 'null'));
console.log('Mobile:', JSON.parse(localStorage.getItem('characterPositionsMobile') || 'null'));

