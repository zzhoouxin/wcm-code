import { runInContext } from 'vm';
import { isMainThread } from 'worker_threads';

const { assemblyActionData } = require('./template/actionTemplate');
const { assemblyModelHeadCode } = require('./template/modelTemplate');

assemblyActionData();
assemblyModelHeadCode();
