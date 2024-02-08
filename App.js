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
  const [menuVisible, setMenuVisible] = useState(false); // 메뉴 화면 가시성 상태

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

  const saveTodos = async (updatedTodos) => {
    try {
      await AsyncStorage.setItem('@todos', JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Failed to save todos to AsyncStorage', error);
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
    setTodos(updatedTodos);
    saveTodos(updatedTodos); // 할 일 목록을 AsyncStorage에 저장하고 데이터 가져오기
  };
  
  const handleDeleteAllTodos = () => {
    setTodos([]);
    saveTodos([]); // 빈 할 일 목록을 AsyncStorage에 저장하고 데이터 가져오기
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>해야 할 것들</Text>
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
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              // 다른 메뉴 아이템에 대한 기능 구현
            }}>
            <Text style={styles.menuItemText}>메뉴 아이템 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              // 다른 메뉴 아이템에 대한 기능 구현
            }}>
            <Text style={styles.menuItemText}>메뉴 아이템 2</Text>
          </TouchableOpacity>
          {/* 필요에 따라 추가 메뉴 아이템 구현 */}
        </View>
      )}
      <TouchableOpacity
        style={styles.deleteAllButton}
        onPress={handleDeleteAllTodos}>
        <Text style={styles.deleteAllButtonText}>전체 삭제</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
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
    marginBottom: 5,
  },
  menu: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: '60%', // 메뉴 화면의 너비 조정
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // 투명도 조정
    borderRadius: 10,
    padding: 20,
    zIndex: 2, // 다른 컴포넌트 위에 표시되도록 zIndex 설정
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
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
});

export default App;
