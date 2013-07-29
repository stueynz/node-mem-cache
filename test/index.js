var assert = require("assert");
var Cache = require("../index");

describe ("lib.cache", function() {

    it ("should be able to create an instance", function (done) {

        var cache = new Cache();

        assert.ok(cache);
        assert.ok(cache instanceof Cache);
        assert.equal(0, cache.length);

        cache.clean();
        done();
    });


    it ("should be able to add a value", function (done) {

        var cache = new Cache();
        cache.set("foo", "bar");

        assert.equal(1, cache.length);

        cache.clean();
        done();
    });


    it ("should be able to get a value by its key", function (done) {

        var cache = new Cache();
        cache.set("foo0", "bar0");
        cache.set("foo4", "bar4");
        cache.set("foo1", "bar1");
        cache.set("foo3", "bar3");
        cache.set("foo2", "bar2");

        assert.equal(5, cache.length);

        var value = cache.get("foo2");
        assert.equal("bar2", value);
        assert.equal(5, cache.length);
        
        cache.clean();
        done();
    });


    it ("should return a null value if an entry for the key does not exist", function (done) {

        var cache = new Cache();
        cache.set("foo0", "bar0");
        cache.set("foo4", "bar4");
        cache.set("foo1", "bar1");

        var value = cache.get("baz");
        assert.equal(null, value);
        
        cache.clean();
        done();
    });

    it ("should be able to update a value by its key", function (done) {

        var cache = new Cache();
        cache.set("foo0", "bar0");
        cache.set("foo4", "bar4");
        cache.set("foo1", "bar1");
        cache.set("foo3", "bar3");
        cache.set("foo2", "bar2");

        cache.set("foo1", "baz");
        assert.equal(5, cache.length);

        var value = cache.get("foo1");
        assert.equal(value, "baz");
        assert.equal(5, cache.length);
        
        cache.clean();
        done();
    });



    it ("should be able to remove a value by its key", function (done) {

        var cache = new Cache();
        cache.set("foo0", "bar0");
        cache.set("foo4", "bar4");
        cache.set("foo1", "bar1");
        cache.set("foo2", "bar2");
        cache.set("foo3", "bar3");

        var value = cache.remove("foo2");
        assert.equal(value, "bar2");
        assert.equal(4, cache.length);
        
        cache.clean();
        done();
    });

    it ("should expire an item by timeout", function (done) {

        var now = new Date().getTime();

        var cache = new Cache();        
        cache.set("foo0", "bar0");
        cache.set("foo1", "bar1");

        var timeout = 100;
        cache.set("foo2", "bar2", timeout);

        assert.equal(3, cache.length);

        cache.on("expired", function(item) {

            assert.equal("foo2", item.key);
            assert.equal("bar2", item.value);
;
            var delta =new Date().getTime() - now;  
            assert.ok( timeout < delta);
            assert.ok( timeout*2 > delta);
            assert.equal(2, cache.length);

            assert.equal(null, cache.get("foo2"));
            
            cache.clean();
            done();
        });
    });

    it ("should not expire an item if timeouts are disabled", function (done) {
        var cache = new Cache({ timeoutDisabled: true });
        
        cache.on("expired", function(item) {
            throw new Error("Should not expire items!!");
        });

        cache.set("foo0", "bar0");
        cache.set("foo1", "bar1");

        var timeout = 100;
        cache.set("foo2", "bar2", timeout);

        setTimeout( function() {
            
            var value = cache.get("foo2");
            assert.equal("bar2", value);
            
            cache.clean();
            done();
        
        }, timeout * 2);
    });


    it ("should renew the item's timeout on every single 'get' ", function (done) {

        var now = new Date().getTime();

        var cache = new Cache({ doesNotRenewTimeout: false });        
        cache.set("foo0", "bar0");
        cache.set("foo1", "bar1");

        var timeout = 100;
        cache.set("foo2", "bar2", timeout);

        setTimeout( function() {
            
            var value = cache.get("foo2");
            assert.equal("bar2", value);
        
            setTimeout( function() {
                
                var value = cache.get("foo2");
                assert.equal("bar2", value);
            
            }, timeout * 2/3);
        }, timeout * 2/3);

        cache.on("expired", function(item) {
            assert.equal("foo2", item.key);
            assert.equal("bar2", item.value);

            assert.ok(timeout + timeout * 4/3 < new Date().getTime() - now);
            assert.equal(2, cache.length);
            
            cache.clean();
            done();
        });

    });

    it ("should be able to clean the cache", function (done) {
        var cache = new Cache();        
        cache.set("foo0", "bar0");
        cache.set("foo1", "bar1");
        assert.equal(2, cache.length);
        cache.clean();
        assert.equal(0, cache.length);
        done();
    });
});
