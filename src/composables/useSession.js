import { ref, onMounted } from 'vue';

export function useSession() {
  const username = ref('');
  const sessionId = ref('');
  const showNamePrompt = ref(false);

  const initSession = () => {
    const storedName = localStorage.getItem('username');
    const storedSession = localStorage.getItem('session_id');

    if (storedName && storedSession) {
      username.value = storedName;
      sessionId.value = storedSession;
    } else {
      showNamePrompt.value = true;
      sessionId.value = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('session_id', sessionId.value);
    }
  };

  const saveName = (name) => {
    if (name.trim()) {
      username.value = name;
      localStorage.setItem('username', name);
      showNamePrompt.value = false;
    }
  };

  onMounted(() => {
    initSession();
  });

  return {
    username,
    sessionId,
    showNamePrompt,
    saveName
  };
}
