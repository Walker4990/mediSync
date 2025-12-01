export default function DrugInsectionDetail({ drug }) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{drug.drugName} 상세정보</h2>
      <div className="mb-5 grid grid-cols-2 gap-4 text-gray-600">
        <div>
          <p>약품 코드 : {drug.drugCoded}</p>
          <p>제약사 : {drug.supplier}</p>
          <p>수량 : {drug.totalQuantity}</p>
        </div>
        <div>
          <p>만료일 : {drug.expirationDate}</p>
          <p>가격 : {drug.unitPrice}원</p>
          <p>위치 : {drug.location}</p>
        </div>
      </div>
    </>
  );
}
