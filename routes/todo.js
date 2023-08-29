import { Router } from 'express';
import { run, get } from '../services/database.js';
import { postValidator, patchValidator } from '../middlewares/validator.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const toDos = await get('SELECT * FROM todos', [], true);
    const data = toDos.map((toDo) => ({
      id: toDo.id,
      title: toDo.title,
      description: toDo.description,
      done: Boolean(toDo.done),
    }));
    res.json({ message: 'To-dos retrieved successfully', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while fetching the to-dos',
      error,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const toDo = await get('SELECT * FROM todos WHERE id = ?', [id], true);
    if (!Array.isArray(toDo) || toDo.length === 0) {
      return res.status(404).json({ message: 'To-do not found' });
    }
    const data = [
      {
        id: toDo[0].id,
        title: toDo[0].title,
        description: toDo[0].description,
        done: Boolean(toDo[0].done),
      },
    ];
    res.json({ message: 'To-do retrieved successfully', data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while fetching the to-do',
      error,
    });
  }
});

router.post('/', postValidator, async (req, res) => {
  try {
    const { title, description } = req.body;
    const data = await run(
      'INSERT INTO todos (title, description) VALUES (?,?)',
      [title, description]
    );
    res.json({
      message: 'To-do created successfully',
      toDo: {
        id: data.lastID,
        title,
        description,
        done: false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while creating the new to-do',
      error,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const toDo = await get('SELECT * FROM todos WHERE id = ?', [id]);
    if (!Array.isArray(toDo) || toDo.length === 0) {
      return res.status(404).json({ message: 'To-do not found' });
    }
    await run('DELETE FROM todos WHERE id = ?', [id]);
    const { title, description, done } = toDo[0];
    res.json({
      message: 'To-do deleted successfully',
      toDo: {
        id: Number(id),
        title,
        description,
        done: Boolean(done),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while deleting the to-do',
      error,
    });
  }
});

router.patch('/:id', patchValidator, async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const toDo = await get('SELECT * FROM todos WHERE id = ?', [id]);
    if (!Array.isArray(toDo) || toDo.length === 0) {
      return res.status(404).json({ message: 'To-do not found' });
    }
    const { title, description, done } = req.body;
    const updatedFields = Object.entries({
      title,
      description,
      done,
    }).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc.push(`${key} = ?`);
      }
      return acc;
    }, []);
    await run(
      `UPDATE todos SET ${updatedFields} WHERE id = ?`,
      Object.values({ title, description, done })
        .filter((value) => value !== undefined)
        .concat(id)
    );
    res.json({
      message: 'To-do updated successfully',
      toDo: {
        id: Number(id),
        title: title || toDo[0].title,
        description: description || toDo[0].description,
        done: Boolean(done),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'An error occurred while updating the to-do',
      error,
    });
  }
});

export default router;
