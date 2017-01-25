var chai = require('chai');
var expect = chai.expect;
var ottoman = require('./../lib/ottoman');
var JsSerializer = require('./../lib/jsserializer');

describe('Serializers', function () {
  it('should parse correctly', function (done) {
    var o = new ottoman.Ottoman();
    var AddressSch = o.schema('Address', {
      street: 'string',
      country: 'string'
    });
    var GroupMdl = o.model('Group', {
      name: 'string'
    });
    var TestMdl = o.model('Test', {
      name: 'string',
      address: AddressSch,
      group: GroupMdl
    });

    var ser = new JsSerializer(o);

    var testGrp = new GroupMdl({
      name: 'Admin'
    });
    var testObj = new TestMdl({
      name: 'Brett',
      address: {
        street: '0 AVE',
        country: 'Canada'
      },
      group: testGrp
    });

    console.log(testObj);

    var testObjSer = ser.serialize(testObj);
    console.log(testObjSer);

    var testGrpSer = ser.serialize(testGrp);
    console.log(testGrpSer);

    var testObjDes = ser.deserialize(TestMdl, testObjSer);
    console.log(testObjDes);



    done();
  });
});
