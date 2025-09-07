// Chat store module
export default {
  namespaced: true,
  
  state: {
    isConnected: false,
    sellerRooms: [],
    memberRooms: [],
    currentChat: null,
    messages: [],
    loading: false,
    error: null
  },
  
  getters: {
    isConnected: state => state.isConnected,
    sellerRooms: state => state.sellerRooms,
    memberRooms: state => state.memberRooms,
    currentChat: state => state.currentChat,
    messages: state => state.messages,
    loading: state => state.loading,
    error: state => state.error
  },
  
  mutations: {
    SET_CONNECTION_STATUS(state, status) {
      state.isConnected = status
    },
    
    SET_SELLER_ROOMS(state, rooms) {
      state.sellerRooms = rooms
    },
    
    SET_MEMBER_ROOMS(state, rooms) {
      state.memberRooms = rooms
    },
    
    SET_CURRENT_CHAT(state, chat) {
      state.currentChat = chat
    },
    
    SET_MESSAGES(state, messages) {
      state.messages = messages
    },
    
    ADD_MESSAGE(state, message) {
      state.messages.push(message)
    },
    
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async ensureConnected({ commit, state }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        // 模擬連接邏輯
        console.log('Chat: 確保連接狀態...')
        
        // 這裡會是實際的聊天連接邏輯
        // 目前只是模擬成功連接
        commit('SET_CONNECTION_STATUS', true)
        
        return { success: true }
      } catch (error) {
        console.error('Chat: 連接失敗', error)
        commit('SET_ERROR', error.message)
        commit('SET_CONNECTION_STATUS', false)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSellerRooms({ commit }, sellerId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        console.log('Chat: 載入賣家聊天室...', sellerId)
        
        // 這裡會是實際的 API 請求
        // 目前只是模擬回傳空陣列
        const rooms = []
        
        commit('SET_SELLER_ROOMS', rooms)
        return { success: true, data: rooms }
      } catch (error) {
        console.error('Chat: 載入賣家聊天室失敗', error)
        commit('SET_ERROR', error.message)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchMemberRooms({ commit }, memberId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        console.log('Chat: 載入會員聊天室...', memberId)
        
        // 這裡會是實際的 API 請求
        // 目前只是模擬回傳空陣列
        const rooms = []
        
        commit('SET_MEMBER_ROOMS', rooms)
        return { success: true, data: rooms }
      } catch (error) {
        console.error('Chat: 載入會員聊天室失敗', error)
        commit('SET_ERROR', error.message)
        return { success: false, error: error.message }
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async sendMessage({ commit, state }, { message, chatId }) {
      try {
        console.log('Chat: 發送訊息...', { message, chatId })
        
        // 這裡會是實際的訊息發送邏輯
        const newMessage = {
          id: Date.now(),
          content: message,
          timestamp: new Date(),
          chatId: chatId
        }
        
        commit('ADD_MESSAGE', newMessage)
        return { success: true, data: newMessage }
      } catch (error) {
        console.error('Chat: 發送訊息失敗', error)
        commit('SET_ERROR', error.message)
        return { success: false, error: error.message }
      }
    }
  }
}