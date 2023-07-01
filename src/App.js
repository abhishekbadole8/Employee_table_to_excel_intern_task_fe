import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import Papa from "papaparse";

function App() {
  const modalRef = useRef();

  const [user, setUser] = useState();
  const [editUser, setEditUser] = useState({});
  const [isModal, setIsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const Token = `c89494bad16cdea5964cbc2c8e32a8cb702e96755a606c2c5d110286e2bba346`;

  const fetchURL = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/dashboard?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      if (response.status === 200) {
        const data = await response.data;
        setUser(data);
        setTotalPages(data.total_pages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClick = (data) => {
    setEditUser({ ...data });
    setIsModal(true);
  };

  const handleInput = (e) => {
    setEditUser((prevEditUser) => ({
      ...prevEditUser,
      [e.target.name]: e.target.value,
    }));
    setIsModal(true);
  };

  // Edit Function
  const handleSubmit = async () => {
    try {
      const { id, name, email, gender } = editUser;
      const response = await axios.patch(
        `http://localhost:5000/api/users/edit/${id}`,
        { name, email, gender },
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      if (response) {
        const updatedUser = response.data;
        setUser((prevUser) => {
          const updatedUserList = prevUser.map((user) => {
            if (user.id === id) {
              return { ...user, ...updatedUser };
            }
            return user;
          });
          return updatedUserList;
        });
        setIsModal(false);
        setEditUser({});
      }
    } catch (error) {
      console.log("Edit User error:", error);
    }
  };

  // Export Function
  const exportToCSV = () => {
    try {
      if (user && user.length > 0) {
        const csv = Papa.unparse(user);

        const element = document.createElement("a");
        element.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        element.target = "_blank";
        element.download = "user_master.csv";
        element.click();
      }
    } catch (error) {
      console.log("Export CSV error:", error);
    }
  };

  // Modal Outside Click close
  const closeModal = () => {
    setIsModal(false);
    setEditUser({});
  };

  const handleModalOutSideClick = (e) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  const handlePrevPage = () => {
    setPage((prevPage) => prevPage - 1);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    fetchURL();
  }, [page]);

  return (
    <div className="App">
      <div className="button-container">
        <button className="excel-button" onClick={exportToCSV}>
          Export
        </button>
      </div>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            {user !== undefined ? (
              <tr>
                {Object.keys(user[0]).map((key) => {
                  return (
                    <th key={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  );
                })}
              </tr>
            ) : (
              <th>Loading...</th>
            )}
          </thead>

          {/* Body Start here */}

          <tbody>
            {user !== undefined ? (
              user.map((data) => {
                return (
                  <>
                    <tr key={data.id}>
                      {Object.values(data).map((val, i) => {
                        return <td key={i}>{val}</td>;
                      })}
                      <td>
                        <button
                          onClick={() => handleEditClick(data)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  </>
                );
              })
            ) : (
              <>
                <tr>
                  <td>Loading...</td>
                  <td>Loading...</td>
                  <td>Loading...</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <button
          className="pagination-button"
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="pagination-page">{page}</span>
        <button
          className="pagination-button"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal here */}
      {isModal && (
        <>
          <div
            className="modal-wrapper"
            ref={modalRef}
            onClick={handleModalOutSideClick}
          >
            <div className="modal-box">
              <div className="input-inside-container">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editUser.name}
                  onChange={(e) => handleInput(e)}
                  placeholder="Enter Name"
                />
              </div>

              <div className="input-inside-container">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={(e) => handleInput(e)}
                  placeholder="Enter Email"
                />
              </div>

              <div className="input-inside-container">
                <label>Gender</label>
                <input
                  type="text"
                  name="gender"
                  value={editUser.gender}
                  onChange={(e) => handleInput(e)}
                  placeholder="Enter Gender"
                />
              </div>

              <button onClick={handleSubmit} className="update-button">
                Update
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
