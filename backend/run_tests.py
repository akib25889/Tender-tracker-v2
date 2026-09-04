import sys
import time
import inspect
from tests import test_api_integration

def run():
    print("=" * 65)
    print(" TenderTracker Command Center - E2E Integration Test Suite")
    print("=" * 65)
    
    test_functions = [
        getattr(test_api_integration, name)
        for name in dir(test_api_integration)
        if name.startswith("test_") and callable(getattr(test_api_integration, name))
    ]
    test_functions.sort(key=lambda f: f.__name__)
    
    passed = 0
    failed = 0
    start_all = time.time()
    
    for test_fn in test_functions:
        name = test_fn.__name__
        print(f"> Running {name:<50}", end="", flush=True)
        t0 = time.time()
        try:
            test_fn()
            duration_ms = (time.time() - t0) * 1000
            print(f" [ PASS ] ({duration_ms:.1f}ms)")
            passed += 1
        except Exception as e:
            duration_ms = (time.time() - t0) * 1000
            print(f" [ FAIL ] ({duration_ms:.1f}ms)")
            print(f"  Error: {e}")
            failed += 1
            
    total_time = time.time() - start_all
    print("=" * 65)
    print(f" Results: {passed} passed, {failed} failed (Total: {total_time:.2f}s)")
    print("=" * 65)
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run())
