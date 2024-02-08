import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [textInput, setTextInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [todos, setTodos] = useState([]);
  const [completedVisible, setCompletedVisible] = useState(false); // 완료된 일정 페이지 가시성 상태
  const [completedItems, setCompletedItems] = useState([]); // 완료된 일정 목록

  // AsyncStorage에서 할 일 목록을 불러와서 설정
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem('@todos');
        if (storedTodos !== null) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error('Failed to load todos from AsyncStorage', error);
      }
    };
    loadTodos();
  }, []);

  // AsyncStorage에서 완료된 일정 목록을 불러와서 설정
  const loadCompletedItems = async () => {
    try {
      const storedCompletedItems = await AsyncStorage.getItem('@completedItems');
      if (storedCompletedItems !== null) {
        setCompletedItems(JSON.parse(storedCompletedItems));
      }
    } catch (error) {
      console.error('Failed to load completed items from AsyncStorage', error);
    }
  };

  // 완료된 일정 목록 불러오기
  useEffect(() => {
    if (completedVisible) {
      loadCompletedItems();
    }
  }, [completedVisible]);
  
  const saveTodos = async (updatedTodos) => {
    try {
      await AsyncStorage.setItem('@todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Failed to save todos to AsyncStorage', error);
    }
  };

  const saveCompletedItems = async (updatedCompletedItems) => {
    try {
      await AsyncStorage.setItem('@completedItems', JSON.stringify(updatedCompletedItems));
    } catch (error) {
      console.error('Failed to save completed items to AsyncStorage', error);
    }
  };
  
  const handleAddTodo = () => {
    if (textInput.trim() === '') return;
    const newTodo = {
      id: todos.length,
      title: textInput,
      timestamp: new Date().toLocaleString(),
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // 할 일 목록을 AsyncStorage에 저장
    setTextInput('');
  };
  
  const handleDeleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    // 완료 시간 추가
  const completedTimestamp = new Date().toLocaleString();
  const updatedCompletedItems = [...completedItems, { ...todoToDelete, completedTimestamp }];
  
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // 할 일 목록을 AsyncStorage에 저장하고 데이터 가져오기
    // 해당 항목을 완료된 일정 페이지로 이동
    const todoToDelete = todos.find((todo) => todo.id === id);
    setCompletedItems([...completedItems, todoToDelete]);
    saveCompletedItems([...completedItems, todoToDelete]); // 완료된 일정 목록을 AsyncStorage에 저장
  };

  const handleDeleteAllTodos = () => {
    setTodos([]);
    saveTodos([]); // 빈 할 일 목록을 AsyncStorage에 저장하고 데이터 가져오기
  };
  
  const handleDeleteCompleted = (id) => {
    const updatedCompletedItems = completedItems.filter((item) => item.id !== id);
    setCompletedItems(updatedCompletedItems);
    saveCompletedItems(updatedCompletedItems); // 완료된 일정 목록을 AsyncStorage에 저장하고 데이터 가져오기
  };
  
  const handleDeleteAllCompleted = () => {
    setCompletedItems([]);
    saveCompletedItems([]); // 빈 완료된 일정 목록을 AsyncStorage에 저장하고 데이터 가져오기
  };

  const renderCompletedItem = ({ item }) => (
    <View style={styles.todoItem}>
      <View>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteCompleted(item.id)}>
        <Text style={styles.deleteButton}>❌</Text>
      </TouchableOpacity>
    </View>
  );
  
  
  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <View>
        <Text style={styles.todoTitle}>{item.title}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteTodo(item.id)}>
        <Text style={styles.deleteButton}>✔️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;
  
  return (
    <View style={styles.container}>
      {/* 해야 할 것들 페이지 */}
      {!completedVisible && (
        <>
          <View style={styles.header}>
            
            <Text style={styles.title}>할 일들</Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setSearchText('')}>
              <Text style={styles.searchButtonText}>지움</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="검색"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
            />
          </View>
  
          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              placeholder="새로운 할 일을 입력하세요"
              value={textInput}
              onChangeText={(text) => setTextInput(text)}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
  
          <FlatList
            data={todos.filter((todo) =>
              todo.title.toLowerCase().includes(searchText.toLowerCase())
            )}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={renderSeparator}
            ListFooterComponent={renderSeparator}
          />
  
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAllTodos}>
            <Text style={styles.deleteAllButtonText}>전체 삭제</Text>
          </TouchableOpacity>
        </>
      )}
  
      {/* 완료된 일정 페이지 */}
      {completedVisible && (
        <View style={styles.completedPage}>
          <Text style={styles.title}>완료된 일정</Text>
          {/* 완료된 일정 목록 표시 */}
          <FlatList
            data={completedItems.filter((item) =>
              item.title.toLowerCase().includes(searchText.toLowerCase())
            )}
            renderItem={renderCompletedItem}
            keyExtractor={(item) => item.id.toString()}
            ItemSeparatorComponent={renderSeparator}
            ListFooterComponent={renderSeparator}
          />
          {/* 전체 삭제 기능 구현 */}
          <TouchableOpacity
            style={styles.deleteAllButton}
            onPress={handleDeleteAllCompleted}>
            <Text style={styles.deleteAllButtonText}>전체 삭제</Text>
          </TouchableOpacity>
        </View>
      )}
  
      {/* 메뉴 버튼 */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setCompletedVisible(!completedVisible)}>
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop:30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft:30,
  },
  searchButton: {
    padding: 10,
    color:'#3c7ade',
  },
  searchButtonText: {
    color: '#3c7ade',
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '40%',
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#3c7ade',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  todoTitle: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    fontSize: 20,
    color: 'red',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    //marginBottom:5,
    marginTop:7,
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 3,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop:20,
  },
  deleteAllButton: {
    backgroundColor: '#fc4c4c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedPage: {
    flex: 1,
    padding: 5,
    backgroundColor: '#fff',
  },
});

export default App;
