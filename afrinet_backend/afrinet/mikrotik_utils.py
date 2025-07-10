from routeros_api import RouterOsApiPool
from django.conf import settings

def test_connection_to_device(device):
    try:
        connection = RouterOsApiPool(
            host=device.ip,
            username=device.username,
            password=device.password,
            port=device.port,
            plaintext_login=True
        )
        api = connection.get_api()
        # Simple test - get system identity
        api.get_resource('/system/identity').get()
        return True
    except Exception as e:
        print(f"Connection failed: {str(e)}")
        return False
    finally:
        if 'connection' in locals():
            connection.disconnect()