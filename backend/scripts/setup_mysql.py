import pymysql
import sys

def main():
    print("Connecting to local MySQL on 127.0.0.1:3306 with root:akib123...")
    try:
        conn = pymysql.connect(
            host="127.0.0.1",
            port=3306,
            user="root",
            password="akib123",
            autocommit=True
        )
        with conn.cursor() as cur:
            cur.execute("CREATE DATABASE IF NOT EXISTS tender_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print("[+] Database 'tender_tracker' created / verified.")

            # Create tender_user if desired
            try:
                cur.execute("CREATE USER IF NOT EXISTS 'tender_user'@'localhost' IDENTIFIED BY 'akib123';")
                cur.execute("ALTER USER 'tender_user'@'localhost' IDENTIFIED BY 'akib123';")
                cur.execute("GRANT ALL PRIVILEGES ON tender_tracker.* TO 'tender_user'@'localhost';")
                cur.execute("CREATE USER IF NOT EXISTS 'tender_user'@'127.0.0.1' IDENTIFIED BY 'akib123';")
                cur.execute("ALTER USER 'tender_user'@'127.0.0.1' IDENTIFIED BY 'akib123';")
                cur.execute("GRANT ALL PRIVILEGES ON tender_tracker.* TO 'tender_user'@'127.0.0.1';")
                cur.execute("FLUSH PRIVILEGES;")
                print("[+] User 'tender_user' granted privileges on tender_tracker.")
            except Exception as ue:
                print(f"[!] Note on tender_user creation: {ue}")

        conn.close()
        print("[+] MySQL setup finished successfully.")
        return 0
    except Exception as e:
        print(f"[-] Failed to connect / setup MySQL: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
