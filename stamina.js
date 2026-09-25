    const maxStamina = 12;

    // -------------------------
    // 現在のスタミナ計算
    // @param playerRef - db.collection("players").doc(user.uid);
    // @returns {number} stamina - 現在のスタミナ
    // @returns {timeStamp} lastRecovery - 最終回復時刻
    // -------------------------
    async function getStamina(playerRef) {
      const snap = await playerRef.get();
      const data = snap.data();

      let stamina = data.battle_stamina;

      let lastRecovery = data.last_battle_recovery.toDate();
      const now = new Date();

      // ▼ 回復処理（複数回復にも対応）
      while (stamina < maxStamina &&
            now >= new Date(lastRecovery.getTime() + 1000 * 60 * 60)) {

        stamina++;
        lastRecovery = new Date(lastRecovery.getTime() + 1000 * 60 * 60);
      }

      // ▼ 回復が発生した場合のみ書き戻す
      if (stamina !== data.battle_stamina) {
        await playerRef.update({
          battle_stamina: stamina,
          last_battle_recovery: lastRecovery
        });
      }

      return { stamina, lastRecovery };
    }
    // -------------------------
    // スタミナ１消費して登録    
    // @param playerRef - db.collection("players").doc(user.uid);
    // @param {int} mode - 1:create 2:battle
    // @returns {boolean} - true:スタミナ足りて消費済、false:スタミナ足らずalert

    // -------------------------
    async function consumeStamina(playerRef,mode) {
      // ▼ まず回復計算を getBattleStamina に任せる
      const { stamina: currentStamina, lastRecovery } = await getStamina(playerRef);

      const now = new Date();

      // ▼ スタミナ不足
      if (currentStamina <= 0) {
        alert("スタミナが足りません！");
        return false;
      }

      // ▼ スタミナ消費
      const newStamina = currentStamina - 1;

      // ▼ ★ MAX → 消費した瞬間に回復タイマーをリセット
      let newLastRecovery = lastRecovery;
      if (currentStamina === maxStamina) {
        newLastRecovery = now;
      }

      switch (mode) {
        case 1: //create
            // ▼ Firestoreへ書き戻し（最終バトル時刻も記録）
            await playerRef.update({
                battle_stamina: newStamina,
                last_battle_recovery: newLastRecovery,
                last_create_action: now
            });
            return true;
        case 2: //battle
            // ▼ Firestoreへ書き戻し（最終バトル時刻も記録）
            await playerRef.update({
                battle_stamina: newStamina,
                last_battle_recovery: newLastRecovery,
                last_battle_battle: now
            });
            return true;
        default:
            alert("スタミナ処理でエラーになりました");
            return false;
      }
    }