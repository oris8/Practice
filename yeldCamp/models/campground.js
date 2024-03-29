const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// 몽고에서 몽구스를 이용한 가상특성 설정으로 이미지를 썸네일크기로 조정
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
  // todo 이거 정규표현식으로도 작성해보기
}); // 이렇게 가상특성을 통해서 설정하면, 스키마에 저장되는게 아니라 호출될때마다 실행된 결과값이 나오게됨

// const opts = { toJSON: { virtuals: true } }; 또는 인라인

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    // mapbox는 GeoJSON을 반환
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // owner, user등 // 추가해주고, 시드모델과 값이 다르면 나중에 복잡해지기때문에(뭐가복잡해질까) 추가한다음에 캠프그라운드 모델로가서 모델들에게 author를 업데이트 해줌
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  (opts = { toJSON: { virtuals: true } })
);

// 주의할점: 기본값으로 몽구스를 문서를 json으로 변환할때는 버츄얼을 포함하지 않음
// 포함시키기 위해서는 opts = {toJSON : {virtuals: true}} 옵션 설정이 필요
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // console.log(doc);
  if (doc) {
    // await Review.deleteMany({ campground: doc._id }); /// 자동완성인데 이렇게 하면안되나
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
